import { config } from '$lib/configs'
import { providers } from 'ethers'
import _ from 'lodash'
import { filterBy } from '$lib/operators/filter-by'
import { safeMap } from '$lib/operators/safe-throw'
import { EMPTY, filter, from, map, Observable, of, reduce, shareReplay, switchMap } from 'rxjs'
import type { Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { mapToChainId } from '$lib/operators/web3/network'
import { noUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'

/**@description this is the injected web3 provider, the most useful provider available because it is the only one that can sign transactions/messages but yet not always available so we have a bunch of other providers so the app partially works even without the presence of this provider */
export const Web3ProvidersMeta$: Observable<{
  [id in Web3ProviderId]?: Web3ProviderMetadata
}> = from(_.values(config.Web3Providers)).pipe(
  filterBy(x => x.provider$.pipe(map(x => !!x))),
  map(x => ({ ...x, provider$: x.provider$.pipe(filter(noUndefined), shareReplay(1)) })),
  switchMap(x =>
    x.provider$.pipe(
      safeMap(x => new providers.Web3Provider(x!, 'any'), { silent: true }),
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
      mapToChainId,
      shareReplay(1),
    ),
  })),
  reduce(
    (acc, curr) => ({ ...acc, ...(curr ? { [curr.id]: curr } : {}) }),
    {} as {
      [id in Web3ProviderId]: Web3ProviderMetadata
    },
  ),
  shareReplay(1),
)

Zone.current
  .fork({
    name: 'ProvidersInitialization',
    properties: { bgColor: '#090' },
  })
  .run(() =>
    Web3ProvidersMeta$.subscribe(x =>
      _.values(x).forEach(x => {
        x.chainId$.subscribe()
        x.provider$.subscribe()
        x.web3Provider$.subscribe()
      }),
    ),
  )
