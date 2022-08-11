import { providers } from 'ethers'
import _ from 'lodash'
import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import {
  asyncScheduler,
  catchError,
  combineLatest,
  combineLatestWith,
  delay,
  filter,
  from,
  map,
  mergeAll,
  Observable,
  observeOn,
  of,
  shareReplay,
  startWith,
  switchAll,
  switchMap,
  toArray,
} from 'rxjs'
import { CustomRemoteWeb3Providers$ } from './custom-remote-providers'
import { selectedNetwork$ } from '../web3-network'
import { mapNil, switchSome } from '$lib/operators/pass-undefined'
import { onlineStatus$ } from '$lib/shared/observables/window'
import { safeSwitchMap } from '$lib/operators/safe-throw'
import { config } from '$lib/configs'

/**
 * @description this is the ethers fallback provider, this provider uses a quorum of different providers with defined priority and weights so that we are available to always have a valid provider even if the favorite one is not available.
 */
export const fallbackWeb3Provider$ = combineLatest([
  Web3ProvidersMeta$.pipe(
    switchMap(x => _.values(x)),
    switchMap(x => x.web3Provider$),
    map(x => ({
      provider: x,
      priority: 1,
      weight: 3,
    })),
    toArray(),
    startWith([]),
  ),
  // DefaultWeb3Provider$.pipe(
  //   passNil(
  //     map(_default => [
  //       {
  //         provider: _default,
  //         priority: 3,
  //         weight: 1,
  //       },
  //     ]),
  //   ),
  //   mapNil(() => []),
  //   startWith([]),
  // ),
  CustomRemoteWeb3Providers$.pipe(
    switchSome(
      map(remotes =>
        remotes.map(remote => ({
          provider: remote,
          priority: 2,
          weight: 3,
        })),
      ),
    ),
    mapNil(() => []),
    startWith([]),
  ),
  // BscScanWeb3Provider$.pipe(
  //   passNil(
  //     map(bscScan => [
  //       {
  //         provider: bscScan,
  //         priority: 3,
  //         weight: 2,
  //       },
  //     ]),
  //   ),
  //   mapNil(() => []),
  //   startWith([]),
  // ),
] as Observable<providers.FallbackProviderConfig[]>[]).pipe(
  observeOn(asyncScheduler),
  switchAll(),
  combineLatestWith(selectedNetwork$),
  switchMap(([providers, network]) =>
    _.isNil(network)
      ? of(null)
      : from(
          providers.map(provider =>
            of(provider).pipe(
              safeSwitchMap(
                x =>
                  from(x.provider.getBlockNumber()).pipe(
                    filter(x => x > 0),
                    map(() => x),
                  ),
                { silent: true },
              ),
              safeSwitchMap(
                x =>
                  from(x.provider.getNetwork()).pipe(
                    filter(x => x.chainId === config.Chains[network].id),
                    map(() => x),
                  ),
                { silent: true },
              ),
            ),
          ),
        ).pipe(toArray(), startWith(undefined)),
  ),
  switchSome(
    switchMap(x => from(x).pipe(mergeAll(), toArray())),
    map(x => (x.length === 0 ? null : x)),
  ),
  switchSome(
    map(
      x =>
        new providers.FallbackProvider(
          x,
          1, //TODO: investigate why a response with enough weight cannot meet the quorum of more than 1
        ),
    ),
    safeSwitchMap(
      x =>
        x.blockNumber >= 0 ? of(x) : from(x.getBlockNumber()).pipe(map(n => (n >= 0 ? x : null))),
      { project: null },
    ),
    x => x,
  ),
  catchError((e, o) => {
    console.warn(e)
    return of(null).pipe(
      delay(1000),
      switchMap(() => onlineStatus$),
      filter(x => x),
      switchMap(() => o),
    )
  }),
  mapNil(() => undefined),
  shareReplay(1),
)
