import { config } from '$lib/configs'
import { ActionStatus, Network, Option, Option$, Web3ProviderId } from '$lib/types'
import { Web3ProviderMetadata } from '$lib/types/rxjs'
import _ from 'lodash'
import {
  debounceTime,
  map,
  merge,
  Observable,
  of,
  OperatorFunction,
  pipe,
  switchMap,
  filter,
  first,
  MonoTypeOperatorFunction,
  withLatestFrom,
  shareReplay,
  combineLatest,
  take,
} from 'rxjs'
import { mapNil, switchSome } from '../pass-undefined'
import type EventEmitter from 'events'
import { reEvaluateSwitchMap } from '../re-evaluate'
import { keysOf } from '$lib/shared/utils/type-safe'
import { Web3Errors } from '$lib/helpers/web3-errors'
import { fromEventZone } from '../zone'
import { forkWrap, wrapWith } from '$lib/utils/zone'
import { safeSwitchMap } from '../safe-throw'
import { switchNetwork } from './netowrk-switch'
import { tapWithIndex } from '../tap-with-index'

export const networkChangeTrigger$$ = (meta: Web3ProviderMetadata): Observable<unknown> =>
  meta.web3Provider$.pipe(
    switchMap(
      forkWrap('Event:ProviderNetwork', '#830083', x =>
        merge(
          fromEventZone(x.provider as EventEmitter, 'chainChanged'),
          fromEventZone(x.provider as EventEmitter, 'networkChanged'),
        ).pipe(
          map(() => true as const),
          debounceTime(10),
        ),
      ),
    ),
  )

export const mapToChainId: OperatorFunction<Web3ProviderMetadata, number | null> = pipe(
  reEvaluateSwitchMap(networkChangeTrigger$$),
  // another method:
  // mapToSigner,
  // passNil(
  //   switchMap(signer => {
  //     try {
  //       return from(signer.getChainId()).pipe(
  //         catchError(e => {
  //           console.warn(e)
  //           return of(null)
  //         }),
  //       )
  //     } catch (e) {
  //       console.warn(e)
  //       return of(null)
  //     }
  //   }),
  // ),
  switchMap(meta => meta.web3Provider$),
  safeSwitchMap(provider => provider.getNetwork(), { project: null }),
  switchSome(map(network => network.chainId)),
)

export const mapToNetwork: OperatorFunction<Web3ProviderMetadata, Network | null> = pipe(
  switchMap(x => x.chainId$),
  map(chainId => keysOf(config.Chains).find(net => config.Chains[net].id === chainId) ?? null),
)

export const isOnNetwork$$ =
  (meta$: Option$<Web3ProviderMetadata>) =>
  (
    network$: Option$<Network>,
  ): Observable<
    | boolean
    | Web3Errors.INVALID_PARAMS
    | Web3Errors.UNKNOWN_CHAIN
    | Web3Errors.CHAIN_DISCONNECTED
    | Web3Errors.RESOURCE_NOT_FOUND
  > =>
    combineLatest([meta$, network$]).pipe(
      switchMap(([meta, network]) =>
        _.isUndefined(meta) || _.isUndefined(network)
          ? of(Web3Errors.RESOURCE_NOT_FOUND as const)
          : _.isNull(meta)
          ? of(Web3Errors.INVALID_PARAMS as const)
          : _.isNull(network)
          ? of(Web3Errors.CHAIN_DISCONNECTED as const)
          : of(meta).pipe(
              mapToNetwork,
              switchSome(map(metaNetwork => metaNetwork === network)),
              mapNil(() => Web3Errors.UNKNOWN_CHAIN as const),
            ),
      ),
    )

export function evaluateNetwork(
  network$: Option$<Network>,
  setNetwork: (network: Option<Network>) => void,
  defaultNetwork: Network,
  setLoading: <T>(id: string, state: boolean) => MonoTypeOperatorFunction<T>,
): MonoTypeOperatorFunction<Option<Web3ProviderMetadata>> {
  const zone = Zone.current.fork({ name: 'P:EvaluateNetwork', properties: { bgColor: '#008a98' } })
  return switchSome(
    setLoading('initialProviderNetworkEvaluation', true),
    safeSwitchMap(
      wrapWith(zone, meta => {
        const isCorrect$ = isOnNetwork$$(of(meta))(network$).pipe(
          filter(x => x !== Web3Errors.RESOURCE_NOT_FOUND),
          shareReplay(1),
        )
        const switchFor$$ = switchNetwork(of(meta))
        const matchProviderWithNetwork = () =>
          switchFor$$(network$).pipe(
            filter(x => x !== ActionStatus.PENDING && x !== Web3Errors.RESOURCE_UNAVAILABLE),
            take(1),
            switchMap(x => (x === ActionStatus.SUCCESS ? of(true) : of(false))),
          )
        const matchNetworkWithProvider = () =>
          network$.pipe(
            withLatestFrom(of(meta).pipe(mapToNetwork)),
            tapWithIndex(([, metaNetwork], i) => i === 0 && setNetwork(metaNetwork)),
            filter(([network, metaNetwork]) => network === metaNetwork),
            first(),
            map(() => true),
          )
        const hasNetworkUpdated$ = merge(
          of(meta).pipe(
            mapToNetwork,
            map(() => false),
          ),
          network$.pipe(map(() => true)),
        ).pipe(shareReplay(1))

        return isCorrect$.pipe(
          setLoading('perNetworkChangeNetworkProviderNetworkEvaluation', true),
          withLatestFrom(hasNetworkUpdated$),
          withLatestFrom(meta.provider$),
          switchMap(([[isCorrect, hasNetworkUpdated], provider], i) => {
            if (isCorrect === true) {
              return of(meta)
            }
            if (isCorrect === false) {
              if (
                (i !== 0 && !hasNetworkUpdated) ||
                (meta.id === Web3ProviderId.walletConnect &&
                  provider.connector.peerMeta?.name !== 'MetaMask')
              ) {
                return matchNetworkWithProvider().pipe(map(() => meta))
              }
              if (i !== 0 && hasNetworkUpdated) {
                return matchProviderWithNetwork().pipe(
                  switchMap(x => (x ? of(meta) : matchNetworkWithProvider().pipe(map(() => meta)))),
                )
              }
              // ask for network change from provider if failed disconnect provider
              return matchProviderWithNetwork().pipe(map(x => (x ? meta : null)))
            }
            if (isCorrect === Web3Errors.UNKNOWN_CHAIN) {
              if (i !== 0) {
                return of(null)
              }
              // change to ~~default~~ network and wait for switch
              //    ? if it was successful everything is fine
              //    : if it wasn't, disconnect from provider but keep the network
              return matchProviderWithNetwork().pipe(map(x => (x ? meta : null)))
            }
            // impossible cases
            if (
              isCorrect === Web3Errors.CHAIN_DISCONNECTED ||
              isCorrect === Web3Errors.RESOURCE_NOT_FOUND
            ) {
              return matchNetworkWithProvider().pipe(map(() => meta))
            }
            if (isCorrect === Web3Errors.INVALID_PARAMS) {
              return of(null)
            }
            return of(null)
          }),
          setLoading('perNetworkChangeNetworkProviderNetworkEvaluation', false),
        )
      }),
      { silent: true, project: null },
    ),
    setLoading('initialProviderNetworkEvaluation', false),
  )
}
