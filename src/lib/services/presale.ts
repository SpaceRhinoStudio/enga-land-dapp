import { PreSale as PreSaleContractType, TokenManager } from 'engaland_fundraising_app/typechain'
import { ContributeActionErrors, Sale, SaleStatus } from './sale'
import {
  ControllerContract$,
  PreSaleContract$,
  PreSaleTargetERC20Collateral$,
  TokenManagerContract$,
} from '../../contracts'
import { mapNil, switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  exhaustMap,
  filter,
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
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { Vesting } from '$lib/classes/vesting'
import { ActionStatus, WithDeployBlock } from '$lib/types'
import { executeWrite } from '$lib/operators/web3/wait-for-transaction'
import { mapNilToWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'
import { isUserKYCVerified$ } from '$lib/observables/enga/kyc'
import { combineLatestSwitchMap } from '$lib/operators/combine-latest-switch'
import { parsePPM } from '$lib/operators/web3/ppm'

class PreSaleClass extends Sale<PreSaleContractType> {
  private static _instance: PreSaleClass
  public static getInstance(): PreSaleClass {
    if (!PreSaleClass._instance) {
      PreSaleClass._instance = new PreSaleClass()
    }
    return PreSaleClass._instance
  }

  private constructor() {
    const goal$ = PreSaleContract$.pipe(
      switchSome(
        switchMap(x => x.goal()),
        map(x => Number(utils.formatEther(x))),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const raisedChangeTrigger$$ = (sale: PreSaleContractType) =>
      fromEventFilter(sale, sale.filters.Contribute()).pipe(catchError(() => of(null)))

    const raised$ = PreSaleContract$.pipe(
      switchSome(
        reEvaluateSwitchMap(raisedChangeTrigger$$),
        switchMap(x => x.totalRaised()),
        map(x => Number(utils.formatEther(x))),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const statusChangeTrigger$$ = (sale: PreSaleContractType) =>
      merge(
        fromEventFilter(sale, sale.filters.Close()),
        fromEventFilter(sale, sale.filters.SetOpenDate()),
      ).pipe(catchError(() => of(null)))

    const status$ = PreSaleContract$.pipe(
      switchSome(
        reEvaluateSwitchMap(statusChangeTrigger$$),
        switchMap(x => x.state().catch(() => null) as Promise<SaleStatus>),
      ),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const exchangeRatePPMRaw$ = PreSaleContract$.pipe(
      switchSome(
        switchMap(x => x.exchangeRate()),
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

    const targetCollateral$ = PreSaleTargetERC20Collateral$

    const _minimumContribution$ = PreSaleContract$.pipe(
      switchSome(switchMap(x => x.minimumRequiredToken())),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const userVestingsChangeTrigger$$ = ([manager, address]: [
      WithDeployBlock<TokenManager>,
      string,
    ]) =>
      merge(
        fromEventFilter(
          manager,
          manager.filters['VestingReleased(address,bytes32,uint256)'](address),
        ),
        fromEventFilter(
          manager,
          manager.filters['VestingCreated(address,bytes32,uint256)'](address),
        ),
        fromEventFilter(
          manager,
          manager.filters['VestingRevoked(address,bytes32,uint256)'](address),
        ),
        PreSaleContract$.pipe(
          filter(noNil),
          switchMap(sale =>
            merge(
              fromEventFilter(
                sale,
                sale.filters['Contribute(address,uint256,uint256,bytes32)'](address),
              ),
            ),
          ),
        ),
      ).pipe(catchError(() => of(null)))

    const userVestings$ = TokenManagerContract$.pipe(
      combineLatestWith(signerAddress$),
      switchSomeMembers(
        reEvaluateSwitchMap(userVestingsChangeTrigger$$),
        combineLatestSwitchMap(([x, address]) => x.getHolderVestingCount(address)),
        switchMap(([x, address, n]) =>
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
        withLatestFrom(exchangeRatePPMRaw$.pipe(parsePPM)),
        map(([vestings, price]) =>
          vestings.map(([vest, id]) =>
            !vest.amountTotal.eq(vest.released)
              ? new Vesting(
                  price!,
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

    const canReleaseVestings$ = status$.pipe(
      switchSome(map(x => x === SaleStatus.Closed)),
      distinctUntilChanged(),
      shareReplay(1),
    )
    const canRevokeVesting$ = status$.pipe(
      switchSome(map(x => x === SaleStatus.Refunding)),
      distinctUntilChanged(),
      shareReplay(1),
    )

    super(
      'Presale',
      PreSaleContract$,
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
  ): Observable<ActionStatus.SUCCESS | Web3Errors | ContributeActionErrors> {
    return ControllerContract$.pipe(
      first(),
      switchSome(
        withLatestFrom(amount$),
        exhaustMap(([x, amount]) => x.populateTransaction.contribute(amount)),
        executeWrite(),
        //TODO: double check with event logs
      ),
      mapNilToWeb3Error(),
    )
  }

  public releaseVesting(
    vest: Vesting<PreSaleContractType>,
  ): Observable<ActionStatus.SUCCESS | Web3Errors> {
    return ControllerContract$.pipe(
      first(),
      switchSome(
        exhaustMap(x => x.populateTransaction.release(vest.vestId)),
        executeWrite(),
        //TODO: double check with event logs
      ),
      mapNilToWeb3Error(),
    )
  }

  public revokeVesting(
    vest: Vesting<PreSaleContractType>,
  ): Observable<ActionStatus.SUCCESS | Web3Errors> {
    return ControllerContract$.pipe(
      first(),
      withLatestFrom(signerAddress$),
      switchSomeMembers(
        exhaustMap(([x, address]) => x.populateTransaction.refund(address, vest.vestId)),
        executeWrite(),
      ),
      mapNilToWeb3Error(),
    )
  }
}

export const PreSale = PreSaleClass.getInstance()
