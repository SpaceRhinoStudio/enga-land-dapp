import { rndEndro } from '$lib/helpers/random/endro'
import { controlStreamPayload } from '$lib/operators/control-stream-payload'
import { concatAll, concatMap, delay, map, Observable, scan, startWith, Subject, tap } from 'rxjs'
import type { EndroMeta } from '$lib/types/enga'
import { genArr } from '$lib/shared/utils/random'
import { EndroSortOptions, MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import { BigNumber } from 'ethers'

export type FilteredDataFetchControl = Partial<{
  Load: { limit?: number }
  isLoading: boolean
}>

export function endroMarketplaceItems$Factory(
  filter: { gen: number | undefined },
  sort: EndroSortOptions | MarketplaceSortOptions = MarketplaceSortOptions.latest,
): [controller$: Subject<FilteredDataFetchControl>, items$: Observable<EndroMeta[] | undefined>] {
  const controller$ = new Subject<FilteredDataFetchControl>()

  const items$ = controller$.pipe(
    controlStreamPayload('Load'),
    tap(() => controller$.next({ isLoading: true })),
    delay(3000),
    concatMap(x =>
      genArr(x.limit ?? 10, () => rndEndro()).map(x =>
        !_.isUndefined(filter.gen) ? x.pipe(map(x => ({ ...x, gen: filter.gen as number }))) : x,
      ),
    ),
    tap(() => controller$.next({ isLoading: false })),
    concatAll(),
    scan(
      (acc, x) =>
        [...acc, x].sort((a, b) => {
          if (sort === MarketplaceSortOptions.cheap) {
            return (
              a.marketPrice
                ?.sub(b.marketPrice ?? 0)
                .div(BigNumber.from(10).pow(18))
                .toNumber() ?? 0
            )
          }
          if (sort === MarketplaceSortOptions.expensive) {
            return (
              b.marketPrice
                ?.sub(a.marketPrice ?? 0)
                .div(BigNumber.from(10).pow(18))
                .toNumber() ?? 0
            )
          }
          if (sort === EndroSortOptions.higherGeneration) {
            return b.gen - a.gen
          }
          if (sort === EndroSortOptions.lowerGeneration) {
            return a.gen - b.gen
          }
          return 0
        }),
      [] as EndroMeta[],
    ),
    startWith(undefined),
  )

  return [controller$, items$]
}
