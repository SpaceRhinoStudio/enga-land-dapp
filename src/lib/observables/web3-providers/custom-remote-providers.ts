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
  mergeMap,
  of,
  scan,
  shareReplay,
  tap,
} from 'rxjs'
import { filterBy } from '$lib/operators/filter-by'

/**
 * @description this observable contains a set of custom JSONRPC providers for the selected network based on the endpoints defined in the web3 config
 * this is useful for when there is no web3 injected provider available.
 */
export const CustomRemoteWeb3Providers$ = from(selectedNetwork$).pipe(
  mergeMap(x => config.CustomEndpoints[x]),
  //TODO: make `new` statement inside `RxJS.using`, unsubscribe it by emitting error and/or deleting the resource
  map(x => new providers.JsonRpcProvider(x)),
  mergeMap(provider =>
    from(provider.getBlockNumber()).pipe(
      tap(
        x => x < 1 && provider.emit('error', new Error('endpoint not available')), // avoid extra network overhead
      ),
      filter(x => x >= 1),
      map(() => provider),
      catchError(() => EMPTY),
    ),
  ),
  filterBy(x =>
    x.blockNumber > 0 ? of(true) : from(x.getBlockNumber()).pipe(map(n => (n > 0 ? true : false))),
  ),
  scan(
    (acc, curr) => (curr.network.chainId === acc[0]?.network.chainId ? [...acc, curr] : [curr]),
    [] as providers.JsonRpcProvider[],
  ),
  auditTime(5000),

  shareReplay(1),
)
