import { config } from '$lib/configs'
import {
  PrivateSaleContract$,
  SeedSaleContract$,
  TokenManagerContract$,
} from '../../../contracts/fundraising-contracts'
import type { BigNumber } from 'ethers'
import _ from 'lodash'
import { signerAddress$ } from '$lib/observables/selected-web3-provider'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitOnTrigger } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { safeQueryFilter } from '$lib/operators/web3/safe-query-filter'
import { withUpdatesFrom, withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import {
  filter,
  from,
  map,
  merge,
  mergeAll,
  mergeMap,
  Observable,
  of,
  reduce,
  switchMap,
} from 'rxjs'
import { noNil, noSentinelOrUndefined } from '$lib/utils/no-sentinel-or-undefined'

export type VestingType = {
  txId: string
  price: number
  amount: BigNumber
  release: BigNumber
  started: Date
  cliff: Date
  end: Date
  vestId: string
  saleContractAddress: string
}

export const preSaleSignersVestings$: Observable<VestingType[] | undefined | null> = merge(
  PrivateSaleContract$,
  SeedSaleContract$,
).pipe(
  passNil(
    withUpdatesFrom(signerAddress$),
    switchMap(([contract, address]) =>
      _.isUndefined(address) ? of(undefined) : of([contract, address] as const),
    ),
  ),
  passNil(
    reEmitOnTrigger(([x, address]) =>
      merge(
        fromEventFilter(x, x.filters['Contribute(address,uint256,uint256,bytes32)'](address)),
        TokenManagerContract$.pipe(
          filter(noSentinelOrUndefined),
          filter(noNil),
          switchMap(x =>
            merge(
              fromEventFilter(x, x.filters['VestingReleased(address,bytes32,uint256)'](address)),
              fromEventFilter(x, x.filters['VestingCreated(address,bytes32,uint256)'](address)),
              fromEventFilter(x, x.filters['VestingRevoked(address,bytes32,uint256)'](address)),
            ),
          ),
        ),
      ),
    ),
    mergeMap(([x, address]) =>
      safeQueryFilter(
        x,
        x.filters['Contribute(address,uint256,uint256,bytes32)'](address),
        x.deployedOn,
        'latest',
      ).pipe(map(logs => [x, logs] as const)),
    ),
    mergeMap(([x, logs]) =>
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
    withUpdatesUntilChanged(
      TokenManagerContract$.pipe(filter(noSentinelOrUndefined), filter(noNil)),
    ),
    map(([vestings, tm]) =>
      vestings.map(vest =>
        tm.getVesting(vest.vestId).then(_vest =>
          !_vest.revoked && !_vest.amountTotal.eq(_vest.released)
            ? {
                ...vest,
                amount: _vest.amountTotal,
                release: _vest.released,
                started: new Date(_vest.start.toNumber() * 1000),
                cliff: new Date(_vest.cliff.toNumber() * 1000),
                end: new Date(_vest.end.toNumber() * 1000),
              }
            : undefined,
        ),
      ),
    ),
    mergeMap(x =>
      from(x).pipe(
        mergeAll(),
        filter(noSentinelOrUndefined),
        reduce((acc, x) => [...acc, x], [] as VestingType[]),
      ),
    ),
  ),
)
