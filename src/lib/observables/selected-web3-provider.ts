/**@description these are a set of helpers designed to ease the connecting process for web3 injected providers */

import { config } from '$lib/configs'
import { localCache } from '$lib/contexts/local-cache'
import { isWeb3ProviderId } from '$lib/helpers/validate-web3-provider'
import _ from 'lodash'
import { pipeIfNot } from '$lib/operators/pipe-if-not'
import { isProviderIdAvailable, mapToProviderMeta } from '$lib/operators/web3/provider'
import { passNil } from '$lib/operators/pass-undefined'
import {
  asyncScheduler,
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  mergeMap,
  Observable,
  observeOn,
  of,
  type OperatorFunction,
  pipe,
  shareReplay,
  startWith,
  Subject,
  subscribeOn,
  switchMap,
  tap,
} from 'rxjs'
import type { Nil, Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { requestChainIdCorrection } from '$lib/operators/web3/chain-id'
import { web3Signer, web3SignersAddress, web3SignerWithAddress } from '$lib/operators/web3/signer'
import { requestWalletConnect } from '$lib/operators/web3/wallet-connect'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { passAfter } from '$lib/operators/pass-after'
import type EventEmitter from 'events'
import { withUpdatesFrom } from '$lib/operators/with-updates-from'
import { selectedNetwork$ } from './web3-network'

export const SelectedWeb3ProviderIdController$ = new Subject<
  Partial<{
    Set: string
    Unset: true
  }>
>()

localCache
  .observe<string | null>(config.Web3ProviderIdCacheKey, null)
  .pipe(
    observeOn(asyncScheduler),
    map(x => (x && isWeb3ProviderId(x) ? x : null)),
    distinctUntilChanged(),
    map(x => (!_.isNil(x) ? { Set: x } : { Unset: true as const })),
  )
  .subscribe(SelectedWeb3ProviderIdController$)

export const IsConnectingToSelectedProvider$ = new BehaviorSubject<boolean>(false)

const doesProviderHaveValidSignerWithAddress: OperatorFunction<Web3ProviderId | Nil, boolean> =
  pipe(
    mapToProviderMeta,
    passNil(web3SignerWithAddress),
    map(x => !!x),
  )

export const isProviderOnCorrectChain: OperatorFunction<Web3ProviderId | Nil, boolean> = pipe(
  mapToProviderMeta,
  passNil(mergeMap(x => x?.chainId$)),
  withUpdatesFrom(selectedNetwork$),
  map(([x, network]) => x === config.Chains[network].id),
)

export const SelectedWeb3ProviderId$: Observable<Web3ProviderId | Nil> =
  SelectedWeb3ProviderIdController$.pipe(
    observeOn(asyncScheduler),
    subscribeOn(asyncScheduler),
    filter(x => 'Set' in x || 'Unset' in x),
    map(x => (x.Set && isWeb3ProviderId(x.Set) ? (x.Set as Web3ProviderId) : null)),
    distinctUntilChanged(),

    pipeIfNot(
      pipe(isProviderIdAvailable),
      map(() => null),
    ),

    pipeIfNot(
      pipe(isProviderOnCorrectChain),
      passAfter(
        pipe(
          tap(() => IsConnectingToSelectedProvider$.next(true)),
          mapToProviderMeta,
          passNil(requestChainIdCorrection),
          tap(() => IsConnectingToSelectedProvider$.next(false)),
        ),
      ),
    ),

    pipeIfNot(
      isProviderOnCorrectChain,
      map(() => null),
    ),

    pipeIfNot(
      doesProviderHaveValidSignerWithAddress,
      passAfter(
        pipe(
          tap(() => IsConnectingToSelectedProvider$.next(true)),
          mapToProviderMeta,
          passNil(requestWalletConnect),
          tap(() => IsConnectingToSelectedProvider$.next(false)),
        ),
      ),
    ),
    pipeIfNot(
      doesProviderHaveValidSignerWithAddress,
      map(() => null),
    ),

    switchMap(x =>
      of(x).pipe(
        mapToProviderMeta,
        passNil(
          switchMap(x =>
            x?.provider$.pipe(
              mergeMap(x =>
                merge(
                  fromEvent(x as EventEmitter, 'close'),
                  fromEvent(x as EventEmitter, 'disconnect'),
                ),
              ),
            ),
          ),
        ),
        map(() => null),
        startWith(x),
      ),
    ),
    shareReplay(1),
  )

SelectedWeb3ProviderId$.pipe(distinctUntilChanged()).subscribe(
  localCache.observe<Web3ProviderId | Nil>(config.Web3ProviderIdCacheKey),
)

export const SelectedWeb3ProviderMeta$: Observable<Web3ProviderMetadata | Nil> =
  SelectedWeb3ProviderId$.pipe(mapToProviderMeta, shareReplay(1))

export const SelectedWeb3Signer$: Observable<JsonRpcSigner | Nil> = SelectedWeb3ProviderMeta$.pipe(
  passNil(web3Signer),
  distinctUntilChanged((prev, x) => _.isEqual(prev, x)),
  shareReplay(1),
)

export const SelectedWeb3SignerWithAddress$: Observable<JsonRpcSigner | Nil> =
  SelectedWeb3ProviderMeta$.pipe(
    passNil(web3SignerWithAddress),
    distinctUntilChanged((prev, x) => _.isEqual(prev, x)),
    shareReplay(1),
  )

export const signerAddress$ = SelectedWeb3ProviderMeta$.pipe(
  passNil(web3SignersAddress),
  distinctUntilChanged(),
  shareReplay(1),
)
