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
  first,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  range,
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
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { Vesting } from '$lib/classes/vesting'
import { ActionStatus, WithDeployBlock } from '$lib/types'
import { isUserKYCVerified$ } from '$lib/observables/enga/kyc'
import { executeTx } from '$lib/operators/web3/wait-for-transaction'
import { handleCommonProviderErrors, Web3Errors } from '$lib/helpers/web3-errors'
import { combineLatestSwitchMap } from '$lib/operators/combine-latest-switch'

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

    const exchangeRatePPMRaw$ = SeedSaleContract$.pipe(
      switchSome(
        switchMap(x => x.getExchangeRate()),
        map(x => BigNumber.from(config.PPM).pow(2).div(x)),
      ),
      shareReplay(1),
    )

    const exchangeRatePPM$ = exchangeRatePPMRaw$.pipe(
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
        combineLatestSwitchMap(([x, address]) => x.getHolderVestingCount(address)),
        switchMap(([[x, address], n]) =>
          range(0, n.toNumber()).pipe(
            map(n =>
              utils.solidityKeccak256(
                ['bytes'],
                [utils.solidityPack(['address', 'uint256'], [address, n])],
              ),
            ),
            toArray(),
            map(ids => [x, ids] as const),
          ),
        ),
        switchMap(([x, ids]) =>
          from(ids).pipe(
            mergeMap(id => from(x.getVesting(id)).pipe(map(vest => [vest, id] as const))),
            toArray(),
          ),
        ),
        withLatestFrom(exchangeRatePPMRaw$),
        map(([vestings, price]) =>
          vestings.map(([vest, id]) =>
            !vest.amountTotal.eq(vest.released)
              ? new Vesting(
                  Number(utils.formatEther(price!)),
                  vest.amountTotal,
                  vest.released,
                  new Date(vest.start.toNumber() * 1000),
                  new Date(vest.cliff.toNumber() * 1000),
                  new Date(vest.end.toNumber() * 1000),
                  id,
                  this,
                )
              : null,
          ),
        ),
        map(x => x.filter(noNil)),
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
        executeTx(([x, amount], signer) => x.connect(signer).contribute(amount)),
        //TODO: double check with event logs
        switchSome(map(() => ActionStatus.SUCCESS as const)),
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
        executeTx((x, signer) => x.connect(signer).release(vest.vestId)),
        //TODO: double check with event logs
        switchSome(map(() => ActionStatus.SUCCESS as const)),
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
