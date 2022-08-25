import { config } from '$lib/configs'
import { providers } from 'ethers'
import _ from 'lodash'
import { filterBy } from '$lib/operators/filter-by'
import { safeMap } from '$lib/operators/safe-throw'
import { distinctUntilChanged, EMPTY, filter, from, map, of, shareReplay } from 'rxjs'
import { mapToChainId } from '$lib/operators/web3/network'
import { noUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'
import { toScanArray } from '$lib/operators/scan-array'

/**@description this is the injected web3 provider, the most useful provider available because it is the only one that can sign transactions/messages but yet not always available so we have a bunch of other providers so the app partially works even without the presence of this provider */
export const Web3ProvidersMeta$ = from(_.values(config.Web3Providers)).pipe(
  filterBy(x =>
    x.provider$.pipe(
      map(x => !!x),
      distinctUntilChanged<boolean>(),
    ),
  ),
  map(x => ({ ...x, provider$: x.provider$.pipe(filter(noUndefined), shareReplay(1)) })),
  map(x => ({
    ...x,
    web3Provider$: x.provider$.pipe(
      safeMap(x => new providers.Web3Provider(x!, 'any'), { silent: true }),
      shareReplay(1),
    ),
  })),
  map(x => ({
    ...x,
    chainId$: of(x).pipe(
      map(x => ({ ...x, chainId$: EMPTY })),
      mapToChainId,
      shareReplay(1),
    ),
  })),
  toScanArray(),
  shareReplay(1),
)

Zone.current
  .fork({
    name: 'Init:Providers',
    properties: { bgColor: '#090' },
  })
  .run(() =>
    Web3ProvidersMeta$.subscribe(x =>
      x.forEach(x => {
        x.chainId$.subscribe()
        x.provider$.subscribe()
        x.web3Provider$.subscribe()
      }),
    ),
  )
