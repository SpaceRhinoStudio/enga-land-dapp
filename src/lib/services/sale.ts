import { Web3Errors } from '$lib/helpers/web3-errors'
import { mapNil, switchSomeMembers } from '$lib/operators/pass-undefined'
import { userApprove } from '$lib/operators/web3/approve'
import { userBalanceOf$$ } from '$lib/operators/web3/balance-of'
import { ActionStatus, ConditionedAction, Option$ } from '$lib/types'
import { isEnumMember } from '$lib/utils/enum'
import { parseEther } from '$lib/utils/parse-ether'
import { ERC20 } from 'engaland_fundraising_app/typechain'
import { BigNumber, Contract } from 'ethers'
import _ from 'lodash'
import { combineLatest, first, map, Observable, of, switchMap } from 'rxjs'
import type { Vesting } from '../classes/vesting'

export enum ContributeActionErrors {
  NOT_FUNDING = 'NOT_FUNDING',
  NO_KYC = 'NO_KYC',
  LOW_ALLOWANCE = 'LOW_ALLOWANCE',
  LESS_THAN_MIN = 'LESS_THAN_MIN',
  LOW_BALANCE = 'LOW_BALANCE',
}

export const isContributionError = isEnumMember(ContributeActionErrors)

type ContributeActionStatus = ActionStatus.SUCCESS | Web3Errors | ContributeActionErrors

export enum SaleStatus {
  Pending = 0, // Sale is idle and pending to be started
  Funding = 1, // Sale has started and contributors can purchase tokens
  Refunding = 2, // Sale has not reached goal within period and contributors can claim refunds
  GoalReached = 3, // Sale has reached goal within period and trading is ready to be open
  Closed = 4, // Sale has reached goal within period, has been closed and trading has been opened
}

export abstract class Sale<C extends Contract> {
  public readonly approve: (
    amount$: Observable<BigNumber | string>,
  ) => ConditionedAction<
    | ActionStatus.USELESS
    | Web3Errors.INVALID_PARAMS
    | ActionStatus.FAILURE
    | ContributeActionErrors.LOW_ALLOWANCE
    | Web3Errors.RESOURCE_NOT_FOUND
  >
  public readonly id: string
  public readonly userCollateralBalance$: Option$<BigNumber>
  public readonly canUserContributeAmount$$: (
    amount$: Option$<BigNumber | string>,
  ) => Observable<
    true | ContributeActionErrors | Web3Errors.INVALID_PARAMS | Web3Errors.RESOURCE_NOT_FOUND
  >

  constructor(
    public readonly name: string,
    public readonly contract$: Option$<C>,
    public readonly goal$: Option$<number>,
    public readonly raised$: Option$<number>,
    public readonly status$: Option$<number>,
    public readonly exchangeRatePPM$: Option$<BigNumber>,
    public readonly canUserContribute$: Observable<
      true | Web3Errors.INVALID_PARAMS | ContributeActionErrors | Web3Errors.RESOURCE_NOT_FOUND
    >,
    public readonly targetCollateral$: Option$<ERC20>,
    public readonly minimumContribution$: Option$<BigNumber>,
    public readonly userVestings$: Option$<Vesting<C>[]>,
    public readonly canReleaseVestings$: Option$<boolean>,
    public readonly canRevokeVesting$: Option$<boolean>,
  ) {
    const _approve = userApprove(this.targetCollateral$)(this.contract$)
    this.approve = (amount$: Observable<BigNumber | string>) => {
      const res = _approve(parseEther(amount$))
      return {
        can$: res.can$.pipe(map(x => (x === true ? ContributeActionErrors.LOW_ALLOWANCE : x))),
        call: res.call,
      }
    }
    this.userCollateralBalance$ = userBalanceOf$$(this.targetCollateral$)
    this.id = _.snakeCase(this.name)
    this.canUserContributeAmount$$ = (amount$: Option$<BigNumber | string>) => {
      const _amount$ = parseEther(amount$)
      const _approve = this.approve(_amount$)
      return combineLatest([
        this.canUserContribute$,
        _amount$,
        this.minimumContribution$,
        _approve.can$,
        this.userCollateralBalance$,
      ]).pipe(
        switchSomeMembers(
          map(([can, amount, minimum, approveStatus, balance]) => {
            if (can !== true) {
              return can
            }
            if (amount.lte(0)) {
              return Web3Errors.INVALID_PARAMS as const
            }
            if (amount.lt(minimum)) {
              return ContributeActionErrors.LESS_THAN_MIN
            }
            if (balance.lt(amount)) {
              return ContributeActionErrors.LOW_BALANCE
            }
            if (approveStatus !== ActionStatus.USELESS) {
              return approveStatus === ActionStatus.FAILURE
                ? Web3Errors.INVALID_PARAMS
                : approveStatus
            }
            return true
          }),
        ),
        mapNil(() => Web3Errors.INVALID_PARAMS as const),
      )
    }
    this.contract$.subscribe()
    this.goal$.subscribe()
    this.raised$.subscribe()
    this.status$.subscribe()
    this.exchangeRatePPM$.subscribe()
    this.canUserContribute$.subscribe()
    this.targetCollateral$.subscribe()
    this.minimumContribution$.subscribe()
    this.userVestings$.subscribe()
    this.canReleaseVestings$.subscribe()
    this.canRevokeVesting$.subscribe()
    this.userCollateralBalance$.subscribe()
  }

  protected abstract _contribute(amount$: Observable<BigNumber>): Observable<ContributeActionStatus>

  public contribute(amount$: Observable<BigNumber | string>): Observable<ContributeActionStatus> {
    const _amount$ = parseEther(amount$)
    return this.canUserContributeAmount$$(_amount$).pipe(
      first(),
      switchMap(can => (can !== true ? of(can) : this._contribute(_amount$))),
    )
  }

  public abstract releaseVesting(vest: Vesting<C>): Observable<ActionStatus.SUCCESS | Web3Errors>
  public abstract revokeVesting(vest: Vesting<C>): Observable<ActionStatus.SUCCESS | Web3Errors>
}
