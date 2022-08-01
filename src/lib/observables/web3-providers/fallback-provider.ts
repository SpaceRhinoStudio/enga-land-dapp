import { config } from '$lib/configs'
import { providers } from 'ethers'
import _ from 'lodash'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import { filterBy } from '$lib/operators/filter-by'
import { mapErrors, safeThrowMap } from '$lib/operators/safe-throw'
import { withUpdatesFrom } from '$lib/operators/with-updates-from'
import {
  asyncScheduler,
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  mergeMap,
  observeOn,
  of,
  reduce,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs'
import { BscScanWeb3Provider$ } from './bsc-scan-provider'
import { CustomRemoteWeb3Providers$ } from './custom-remote-providers'
import { DefaultWeb3Provider$ } from './default-provider'
import { logOp } from '$lib/operators/log'

/**
 * @description this is the ethers fallback provider, this provider uses a quorum of different providers with defined priority and weights so that we are available to always have a valid provider even if the favorite one is not available.
 */
export const fallbackWeb3Provider$ = combineLatest({
  external: Web3ProvidersMeta$.pipe(
    mergeMap(x => _.values(x)),
    filterBy(x =>
      x.chainId$.pipe(
        withUpdatesFrom(selectedNetwork$),
        map(([x, network]) => x === config.Chains[network].id),
      ),
    ),
    mergeMap(x => x.web3Provider$),
    reduce((acc, x) => [...acc, x], [] as providers.Web3Provider[]),
    startWith(undefined),
  ),
  _default: DefaultWeb3Provider$.pipe(startWith(undefined)),
  remotes: CustomRemoteWeb3Providers$.pipe(startWith(undefined)),
  bscScan: BscScanWeb3Provider$.pipe(startWith(undefined)),
}).pipe(
  distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)),
  observeOn(asyncScheduler),
  mapErrors(
    safeThrowMap(
      ({ bscScan, _default, external, remotes }) =>
        new providers.FallbackProvider(
          [
            ...(external
              ? _.values(external).map(provider => ({
                  provider: provider,
                  priority: 1,
                  weight: 3,
                }))
              : []),
            ...(remotes
              ? remotes.map(remote => ({
                  provider: remote,
                  priority: 2,
                  weight: 3,
                }))
              : []),
            ...(bscScan
              ? [
                  {
                    provider: bscScan,
                    priority: 3,
                    weight: 2,
                  },
                ]
              : []),
            ...(_default
              ? [
                  {
                    provider: _default,
                    priority: 3,
                    weight: 1,
                  },
                ]
              : []),
          ],
          1, // TODO: investigate why a response with enough weight cannot meet the quorum of more than 1
        ),
    ),
    undefined,
  ),
  switchMap(x =>
    _.isUndefined(x)
      ? of(x)
      : x.blockNumber >= 0
      ? of(x)
      : from(x.getBlockNumber()).pipe(map(n => (n >= 0 ? x : null))),
  ),
  shareReplay(1),
)
