import { PreSale as PreSaleContractType } from 'engaland_fundraising_app/typechain'
import { ContributeActionErrors, Sale, SaleStatus } from './sale'
import {
  ControllerContract$,
  PreSaleContract$,
  PreSaleTargetERC20Collateral$,
  TokenManagerContract$,
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
import { safeQueryFilter } from '$lib/operators/web3/safe-query-filter'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { Vesting } from '$lib/classes/vesting'
import { ActionStatus, WithDeployBlock } from '$lib/types'
import { executeTx } from '$lib/operators/web3/wait-for-transaction'
import { handleCommonProviderErrors, Web3Errors } from '$lib/helpers/web3-errors'
import { isUserKYCVerified$ } from '$lib/observables/enga/kyc'

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

    const exchangeRatePPM$ = PreSaleContract$.pipe(
      switchSome(
        switchMap(x => x.exchangeRate()),
        map(x => BigNumber.from(config.PPM).pow(2).div(x)),
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

    const targetCollateral$ = PreSaleTargetERC20Collateral$

    const _minimumContribution$ = PreSaleContract$.pipe(
      switchSome(switchMap(x => x.minimumRequiredToken())),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const userVestingsChangeTrigger$$ = ([sale, address]: [
      WithDeployBlock<PreSaleContractType>,
      string,
    ]) =>
      merge(
        fromEventFilter(sale, sale.filters['Contribute(address,uint256,uint256,bytes32)'](address)),
        TokenManagerContract$.pipe(
          filter(noNil),
          switchMap(x =>
            merge(
              fromEventFilter(x, x.filters['VestingReleased(address,bytes32,uint256)'](address)),
              fromEventFilter(x, x.filters['VestingCreated(address,bytes32,uint256)'](address)),
              fromEventFilter(x, x.filters['VestingRevoked(address,bytes32,uint256)'](address)),
            ),
          ),
        ),
      ).pipe(catchError(() => of(null)))

    const userVestings$ = PreSaleContract$.pipe(
      combineLatestWith(signerAddress$),
      switchSomeMembers(
        reEvaluateSwitchMap(userVestingsChangeTrigger$$),

        switchMap(([x, address]) =>
          safeQueryFilter(
            x,
            x.filters['Contribute(address,uint256,uint256,bytes32)'](address),
            x.deployedOn,
            'latest',
          ).pipe(map(logs => [x, logs] as const)),
        ),
        switchMap(([x, logs]) =>
          x
            .exchangeRate()
            .then(rate => 1 / (rate.toNumber() / config.PPM))
            .then(price => [x, logs, price] as const),
        ),
        map(([x, logs, price]) =>
          logs.map(log => ({
            vestId: log.args.vestedPurchaseId,
            price,
            txId: log.transactionHash,
            saleContractAddress: x.address,
          })),
        ),
        combineLatestWith(TokenManagerContract$.pipe(filter(noNil))),
        map(([vestings, tm]) =>
          vestings.map(vest =>
            tm
              .getVesting(vest.vestId)
              .then(_vest =>
                !_vest.revoked && !_vest.amountTotal.eq(_vest.released)
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
      map(x => x),
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
  ): Observable<
    | ContributeActionErrors
    | (
        | ActionStatus.FAILURE
        | Web3Errors.REJECTED
        | ActionStatus.SUCCESS
        | Web3Errors.INVALID_PARAMS
      )
  > {
    return ControllerContract$.pipe(
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
    vest: Vesting<PreSaleContractType>,
  ): Observable<
    ActionStatus.FAILURE | Web3Errors.REJECTED | ActionStatus.SUCCESS | Web3Errors.INVALID_PARAMS
  > {
    return ControllerContract$.pipe(
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
    vest: Vesting<PreSaleContractType>,
  ): Observable<
    ActionStatus.FAILURE | Web3Errors.REJECTED | ActionStatus.SUCCESS | Web3Errors.INVALID_PARAMS
  > {
    return ControllerContract$.pipe(
      first(),
      withLatestFrom(signerAddress$),
      switchSomeMembers(
        executeTx(([x, address], signer) => x.connect(signer).refund(address, vest.vestId)),
        switchSome(map(() => ActionStatus.SUCCESS as const)),
      ),
      handleCommonProviderErrors(),
    )
  }
}

export const PreSale = PreSaleClass.getInstance()
