import { config } from '$lib/configs'
import { providers } from 'ethers'
import _ from 'lodash'
import { filterBy } from '$lib/operators/filter-by'
import { safeThrowMap } from '$lib/operators/safe-throw'
import { web3ProviderChainId } from '$lib/operators/web3/chain-id'
import { catchError, EMPTY, from, map, mergeMap, Observable, of, reduce, shareReplay } from 'rxjs'
import type { Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'

export const Web3ProvidersMeta$: Observable<{
  [id in Web3ProviderId]?: Web3ProviderMetadata
}> = from(_.values(config.Web3Providers)).pipe(
  filterBy(x => x.provider$.pipe(map(x => !!x))),
  map(
    x =>
      x as {
        id: Web3ProviderId
        provider$: Observable<providers.ExternalProvider>
      },
  ),
  mergeMap(x =>
    x.provider$.pipe(
      safeThrowMap(x => new providers.Web3Provider(x!, 'any')),
      map(web3Provider => ({
        ...x,
        web3Provider$: of(web3Provider).pipe(shareReplay(1)),
      })),
    ),
  ),
  map(x => ({
    ...x,
    chainId$: of(x).pipe(
      map(x => ({ ...x, chainId$: EMPTY })),
      web3ProviderChainId,
      shareReplay(1),
    ),
  })),
  catchError(() => of(undefined)),
  reduce(
    (acc, curr) => ({ ...acc, ...(curr ? { [curr.id]: curr } : {}) }),
    {} as {
      [id in Web3ProviderId]: Web3ProviderMetadata
    },
  ),
  shareReplay(1),
)
