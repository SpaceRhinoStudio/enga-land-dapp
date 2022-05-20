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
  scan,
  shareReplay,
  tap,
} from 'rxjs'

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
  scan(
    (acc, curr) => (curr.network.chainId === acc[0]?.network.chainId ? [...acc, curr] : [curr]),
    [] as providers.JsonRpcProvider[],
  ),
  auditTime(5000),
  shareReplay(1),
)
