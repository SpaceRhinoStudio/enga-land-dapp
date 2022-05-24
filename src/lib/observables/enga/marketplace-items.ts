import { rndEndro } from '$lib/helpers/random/endro'
import { controlStreamPayload } from '$lib/operators/control-stream-payload'
import { concatAll, concatMap, delay, Observable, scan, Subject, tap } from 'rxjs'
import type { EndroMeta } from '$lib/types/enga'
import { genArr } from '$lib/utils/random'

export const endroMarketplaceItemsController$ = new Subject<{
  Load?: true
  isLoading?: boolean
}>()

export const endroMarketplaceItems$: Observable<EndroMeta[]> =
  endroMarketplaceItemsController$.pipe(
    controlStreamPayload('Load'),
    tap(() => endroMarketplaceItemsController$.next({ isLoading: true })),
    delay(3000),
    concatMap(() => genArr(10, () => rndEndro())),
    tap(() => endroMarketplaceItemsController$.next({ isLoading: false })),
    concatAll(),
    scan((acc, x) => [...acc, x], [] as EndroMeta[]),
  )
