import { providers } from 'ethers'
import _ from 'lodash'
import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import {
  asyncScheduler,
  catchError,
  combineLatest,
  combineLatestWith,
  delay,
  distinctUntilChanged,
  filter,
  from,
  map,
  observeOn,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
  timeout,
  concat,
  throwError,
  switchAll,
} from 'rxjs'
import { CustomRemoteWeb3Providers$ } from './custom-remote-providers'
import { selectedNetwork$ } from '../web3-network'
import { mapNil, switchSome } from '$lib/operators/pass-undefined'
import { onlineStatus$ } from '$lib/shared/observables/window'
import { safeSwitchMap } from '$lib/operators/safe-throw'
import { config } from '$lib/configs'
import { DefaultWeb3Provider$ } from './default-provider'
import { BscScanWeb3Provider$ } from './bsc-scan-provider'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { fromEventZone } from '$lib/operators/zone'
import { isEqual } from '$lib/utils/is-equal'
import { toScanArray } from '$lib/operators/scan-array'
import { reEvaluate } from '$lib/operators/re-evaluate'
import { combineLatestSwitchMap } from '$lib/operators/combine-latest-switch'
import { logOp } from '$lib/operators/log'

/**
 * @description this is the ethers fallback provider, this provider uses a quorum of different providers with defined priority and weights so that we are available to always have a valid provider even if the favorite one is not available.
 */
export const fallbackWeb3Provider$ = combineLatest<
  (providers.FallbackProviderConfig & { id: string })[][]
>([
  Web3ProvidersMeta$.pipe(
    switchAll(),
    combineLatestSwitchMap(x => x.web3Provider$),
    map(([meta, provider]) => ({
      provider: provider,
      priority: 1,
      weight: 2,
      id: meta.id,
      // stallTimeout: 300,
    })),
    toScanArray(),
    startWith([]),
  ),
  DefaultWeb3Provider$.pipe(
    switchSome(
      map(_default => [
        {
          provider: _default,
          priority: 3,
          weight: 1,
          stallTimeout: 300,
          id: 'default',
        },
      ]),
    ),
    mapNil(() => []),
    startWith([]),
  ),
  CustomRemoteWeb3Providers$.pipe(
    switchSome(
      map(remotes =>
        remotes.map(remote => ({
          provider: remote,
          priority: 2,
          weight: 1,
          stallTimeout: 300,
          id: remote.connection.url,
        })),
      ),
    ),
    mapNil(() => []),
    startWith([]),
  ),
  BscScanWeb3Provider$.pipe(
    switchSome(
      map(bscScan => [
        {
          provider: bscScan,
          priority: 3,
          weight: 1,
          stallTimeout: 300,
          id: 'bscScan',
        },
      ]),
    ),
    mapNil(() => []),
    startWith([]),
  ),
]).pipe(
  observeOn(asyncScheduler),
  reEvaluate(onlineStatus$),
  combineLatestWith(selectedNetwork$),
  switchMap(([providers, network]) =>
    _.isNil(network)
      ? of(null)
      : combineLatest(
          providers.flat().map(provider =>
            of(provider).pipe(
              safeSwitchMap(
                x =>
                  from(x.provider.getNetwork()).pipe(
                    map(x => x.chainId === config.Chains[network].id),
                    tap(res => !res && x.provider.emit('error', new Error('wrong network'))),
                    timeout({ first: 5000 }),
                    catchError(() => of(null)),
                    map(res => (res ? x : null)),
                  ),
                { silent: true, project: null },
              ),
              switchSome(
                safeSwitchMap(
                  x =>
                    from(x.provider.getBlockNumber()).pipe(
                      map(x => x > 0),
                      tap(
                        res =>
                          !res && x.provider.emit('error', new Error('provider not available')),
                      ),
                      timeout({ first: 5000 }),
                      catchError(() => of(null)),
                      map(res => (res ? x : null)),
                    ),
                  { silent: true, project: null },
                ),
              ),
              switchSome(
                switchMap(x =>
                  concat(
                    of(x),
                    fromEventZone(x.provider, 'debug').pipe(
                      filter(x => _.get(x, 'error')),
                      switchMap(() => throwError(() => null)),
                      catchError(() => of(null)),
                    ),
                    fromEventZone(x.provider, 'error').pipe(
                      switchMap(() => throwError(() => null)),
                      catchError(() => of(null)),
                    ),
                  ),
                ),
              ),
              // startWith(null),
            ),
          ),
        ).pipe(
          map(x => x.filter(noNil)),
          map(x => (x.length === 0 ? null : x)),
          // startWith(undefined),
        ),
  ),
  distinctUntilChanged(isEqual),
  logOp('SEND_LOG', 'providers', x => x?.map(e => e.id)),
  switchSome(map(x => new providers.FallbackProvider(x, 1))),
  switchMap(x => (_.isNil(x) ? throwError(() => 'unavailable') : of(x))),
  catchError((e, o) => {
    console.warn(e)
    return of(null).pipe(
      delay(1000),
      switchMap(() => onlineStatus$),
      filter(x => x),
      switchMap(() => o),
      startWith(undefined),
    )
  }),
  shareReplay(1),
)
