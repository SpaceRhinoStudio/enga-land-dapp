import { config } from '$lib/configs'
import { providers } from 'ethers'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import {
  auditTime,
  catchError,
  EMPTY,
  filter,
  from,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
  toArray,
} from 'rxjs'
import { filterBy } from '$lib/operators/filter-by'
import { switchSome } from '$lib/operators/pass-undefined'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'

/**
 * @description this observable contains a set of custom JSONRPC providers for the selected network based on the endpoints defined in the web3 config
 * this is useful for when there is no web3 injected provider available.
 */
export const CustomRemoteWeb3Providers$ = from(selectedNetwork$).pipe(
  switchSome(
    auditTime(1000),
    map(x => config.CustomEndpoints[x]),
    map(x =>
      x
        .map(e => {
          try {
            return new providers.JsonRpcProvider(e)
          } catch (e) {
            return null
          }
        })
        .filter(noNil)
        .map(provider =>
          from(provider.getBlockNumber()).pipe(
            tap(
              x => x < 1 && provider.emit('error', new Error('endpoint not available')), // avoid extra network overhead
            ),
            filter(x => x >= 1),
            map(() => provider),
            catchError(() => EMPTY),
          ),
        )
        .map(provider =>
          provider.pipe(
            filterBy(x =>
              x.blockNumber > 0
                ? of(true)
                : from(x.getBlockNumber()).pipe(map(n => (n > 0 ? true : false))),
            ),
          ),
        ),
    ),
    switchMap(x => merge(...x).pipe(toArray())),
  ),
  shareReplay(1),
)
