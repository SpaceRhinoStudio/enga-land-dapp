import { SeedSale as SeedSaleContractType } from 'engaland_fundraising_app/typechain'
import { ContributeActionErrors, Sale, SaleStatus } from './sale'
import {
  SeedSaleContract$,
  SeedSaleTargetERC20Collateral$,
} from '../../contracts/fundraising-contracts'
import { mapNil, switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  first,
  from,
  map,
  merge,
  mergeAll,
  Observable,
  of,
  shareReplay,
  switchMap,
  toArray,
  withLatestFrom,
} from 'rxjs'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { BigNumber, utils } from 'ethers'
import { config } from '$lib/configs'
import { signerAddress$ } from '$lib/observables/selected-web3-provider'
import _ from 'lodash'
import { safeQueryFilter } from '$lib/operators/web3/safe-query-filter'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { Vesting } from '$lib/classes/vesting'
import { ActionStatus, WithDeployBlock } from '$lib/types'
import { isUserKYCVerified$ } from '$lib/observables/enga/kyc'
import { executeTx } from '$lib/operators/web3/wait-for-transaction'
import { handleCommonProviderErrors, Web3Errors } from '$lib/helpers/web3-errors'

class SeedSaleClass extends Sale<SeedSaleContractType> {
  private static _instance: SeedSaleClass
  public static getInstance(): SeedSaleClass {
    if (!SeedSaleClass._instance) {
      SeedSaleClass._instance = new SeedSaleClass()
    }
    return SeedSaleClass._instance
  }

  private constructor() {
    const goal$ = SeedSaleContract$.pipe(
      switchSome(
        switchMap(x => x.daiGoal()),
        map(x => Number(utils.formatEther(x))),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const raisedChangeTrigger$$ = (sale: SeedSaleContractType) =>
      fromEventFilter(sale, sale.filters.VestingCreated())

    const raised$ = SeedSaleContract$.pipe(
      switchSome(
        reEvaluateSwitchMap(raisedChangeTrigger$$),
        switchMap(x => x.totalRaised()),
        map(x => Number(utils.formatEther(x))),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const statusChangeTrigger$$ = (sale: SeedSaleContractType) =>
      merge(fromEventFilter(sale, sale.filters.SaleOpened())).pipe(catchError(() => of(null)))

    const status$ = SeedSaleContract$.pipe(
      switchSome(
        reEvaluateSwitchMap(statusChangeTrigger$$),
        switchMap(x => x.state().catch(() => null) as Promise<SaleStatus>),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const exchangeRatePPM$ = SeedSaleContract$.pipe(
      switchSome(
        switchMap(x => Promise.all([x.engaGoal(), x.daiGoal()])),
        map(([engaGoal, daiGoal]) => daiGoal.mul(BigNumber.from(config.PPM)).div(engaGoal)),
      ),
      combineLatestWith(status$),
      map(([x, status]) => (status === SaleStatus.Funding ? x : null)),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const canUserContribute$ = status$.pipe(
      combineLatestWith(isUserKYCVerified$),
      switchSomeMembers(
        map(([x, isVerified]) =>
          x !== SaleStatus.Funding
            ? ContributeActionErrors.NOT_FUNDING
            : !isVerified
            ? ContributeActionErrors.NO_KYC
            : true,
        ),
      ),
      mapNil(x =>
        x === null
          ? (Web3Errors.INVALID_PARAMS as const)
          : (Web3Errors.RESOURCE_NOT_FOUND as const),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const targetCollateral$ = SeedSaleTargetERC20Collateral$

    const _minimumContribution$ = SeedSaleContract$.pipe(
      switchSome(switchMap(x => x.minimumRequiredToken())),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const userVestingsChangeTrigger$$ = ([sale, address]: [
      WithDeployBlock<SeedSaleContractType>,
      string,
    ]) =>
      merge(
        fromEventFilter(sale, sale.filters['VestingCreated(address,bytes32,uint256)'](address)),
        fromEventFilter(sale, sale.filters['VestingReleased(address,bytes32,uint256)'](address)),
      )

    const userVestings$ = SeedSaleContract$.pipe(
      combineLatestWith(signerAddress$),
      switchSomeMembers(
        reEvaluateSwitchMap(userVestingsChangeTrigger$$),
        switchMap(([x, address]) =>
          safeQueryFilter(
            x,
            x.filters['VestingCreated(address,bytes32,uint256)'](address),
            x.deployedOn,
            'latest',
          ).pipe(map(logs => [x, logs] as const)),
        ),
        switchMap(([x, logs]) =>
          x
            .getExchangeRate()
            .then(rate => 1 / (rate.toNumber() / config.PPM))
            .then(price => [x, logs, price] as const),
        ),
        map(
          ([x, logs, price]) =>
            [
              x,
              logs.map(log => ({
                vestId: log.args.id,
                price,
                txId: log.transactionHash,
                saleContractAddress: x.address,
              })),
            ] as const,
        ),

        map(([x, vestings]) =>
          vestings.map(vest =>
            x
              .getVesting(vest.vestId)
              .then(_vest =>
                !_vest.amountTotal.eq(_vest.released)
                  ? new Vesting(
                      vest.txId,
                      vest.price,
                      _vest.amountTotal,
                      _vest.released,
                      new Date(_vest.start.toNumber() * 1000),
                      new Date(_vest.cliff.toNumber() * 1000),
                      new Date(_vest.end.toNumber() * 1000),
                      vest.vestId,
                      this,
                    )
                  : undefined,
              ),
          ),
        ),
        switchMap(x => from(x).pipe(mergeAll(), filter(noNil), toArray())),
      ),
      shareReplay(1),
    )

    const canReleaseVestings$ = of(true)
    const canRevokeVesting$ = of(false)

    super(
      'Seed Sale',
      SeedSaleContract$,
      goal$,
      raised$,
      status$,
      exchangeRatePPM$,
      canUserContribute$,
      targetCollateral$,
      _minimumContribution$,
      userVestings$,
      canReleaseVestings$,
      canRevokeVesting$,
    )
  }

  protected _contribute(
    amount$: Observable<BigNumber>,
  ): Observable<
    | ContributeActionErrors
    | (
        | ActionStatus.FAILURE
        | Web3Errors.REJECTED
        | ActionStatus.SUCCESS
        | Web3Errors.INVALID_PARAMS
      )
  > {
    return this.contract$.pipe(
      first(),
      switchSome(
        withLatestFrom(amount$),
        executeTx(([x, amount]) => x.contribute(amount)),
        //TODO: double check with event logs
        map(() => ActionStatus.SUCCESS as const),
      ),
      handleCommonProviderErrors(),
    )
  }

  public releaseVesting(
    vest: Vesting<SeedSaleContractType>,
  ): Observable<
    ActionStatus.FAILURE | Web3Errors.REJECTED | ActionStatus.SUCCESS | Web3Errors.INVALID_PARAMS
  > {
    return this.contract$.pipe(
      first(),
      switchSome(
        executeTx(x => x.release(vest.vestId)),
        //TODO: double check with event logs
        map(() => ActionStatus.SUCCESS as const),
      ),
      handleCommonProviderErrors(),
    )
  }

  public revokeVesting(
    vest: Vesting<SeedSaleContractType>,
  ): Observable<
    ActionStatus.FAILURE | Web3Errors.REJECTED | ActionStatus.SUCCESS | Web3Errors.INVALID_PARAMS
  > {
    return of(Web3Errors.INVALID_PARAMS)
  }
}

export const SeedSale = SeedSaleClass.getInstance()
