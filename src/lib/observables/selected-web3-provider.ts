import { config } from '$lib/configs'
import { localCache } from '$lib/contexts/local-cache'
import { isWeb3ProviderId } from '$lib/helpers/validate-web3-provider'
import _ from 'lodash'
import { pipeIfNot } from '$lib/operators/pipe-if-not'
import { isProviderIdAvailable, mapToProviderMeta } from '$lib/operators/web3/provider'
import { passUndefined } from '$lib/operators/pass-undefined'
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
import type { Web3ProviderId } from '$lib/types'
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
  .observe<string | undefined>(config.Web3ProviderIdCacheKey, undefined)
  .pipe(
    observeOn(asyncScheduler),
    map(x => (x && isWeb3ProviderId(x) ? x : undefined)),
    distinctUntilChanged(),
    map(x => (!_.isUndefined(x) ? { Set: x } : { Unset: true as const })),
  )
  .subscribe(SelectedWeb3ProviderIdController$)

export const IsConnectingToSelectedProvider$ = new BehaviorSubject<boolean>(false)

const doesProviderHaveValidSignerWithAddress: OperatorFunction<
  Web3ProviderId | undefined,
  boolean
> = pipe(
  mapToProviderMeta,
  passUndefined(web3SignerWithAddress),
  map(x => !!x),
)

export const isProviderOnCorrectChain: OperatorFunction<Web3ProviderId | undefined, boolean> = pipe(
  mapToProviderMeta,
  passUndefined(mergeMap(x => x?.chainId$)),
  withUpdatesFrom(selectedNetwork$),
  map(([x, network]) => x === config.Chains[network].id),
)

export const SelectedWeb3ProviderId$: Observable<Web3ProviderId | undefined> =
  SelectedWeb3ProviderIdController$.pipe(
    observeOn(asyncScheduler),
    subscribeOn(asyncScheduler),
    filter(x => 'Set' in x || 'Unset' in x),
    map(x => (x.Set && isWeb3ProviderId(x.Set) ? (x.Set as Web3ProviderId) : undefined)),
    distinctUntilChanged(),

    pipeIfNot(
      pipe(isProviderIdAvailable),
      map(() => undefined),
    ),

    pipeIfNot(
      pipe(isProviderOnCorrectChain),
      passAfter(
        pipe(
          tap(() => IsConnectingToSelectedProvider$.next(true)),
          mapToProviderMeta,
          passUndefined(requestChainIdCorrection),
          tap(() => IsConnectingToSelectedProvider$.next(false)),
        ),
      ),
    ),

    pipeIfNot(
      isProviderOnCorrectChain,
      map(() => undefined),
    ),

    pipeIfNot(
      doesProviderHaveValidSignerWithAddress,
      passAfter(
        pipe(
          tap(() => IsConnectingToSelectedProvider$.next(true)),
          mapToProviderMeta,
          passUndefined(requestWalletConnect),
          tap(() => IsConnectingToSelectedProvider$.next(false)),
        ),
      ),
    ),
    pipeIfNot(
      doesProviderHaveValidSignerWithAddress,
      map(() => undefined),
    ),

    switchMap(x =>
      of(x).pipe(
        mapToProviderMeta,
        passUndefined(
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
        map(() => undefined),
        startWith(x),
      ),
    ),
    shareReplay(1),
  )

SelectedWeb3ProviderId$.pipe(distinctUntilChanged()).subscribe(
  localCache.observe<Web3ProviderId | undefined>(config.Web3ProviderIdCacheKey),
)

export const SelectedWeb3ProviderMeta$: Observable<Web3ProviderMetadata | undefined> =
  SelectedWeb3ProviderId$.pipe(mapToProviderMeta, shareReplay(1))

export const SelectedWeb3Signer$: Observable<JsonRpcSigner | undefined> =
  SelectedWeb3ProviderMeta$.pipe(
    passUndefined(web3Signer),
    distinctUntilChanged((prev, x) => _.isEqual(prev, x)),
    shareReplay(1),
  )

export const SelectedWeb3SignerWithAddress$: Observable<JsonRpcSigner | undefined> =
  SelectedWeb3ProviderMeta$.pipe(
    passUndefined(web3SignerWithAddress),
    distinctUntilChanged((prev, x) => _.isEqual(prev, x)),
    shareReplay(1),
  )

export const SelectedWeb3SignersAddress$ = SelectedWeb3ProviderMeta$.pipe(
  passUndefined(web3SignersAddress),
  distinctUntilChanged(),
  shareReplay(1),
)
