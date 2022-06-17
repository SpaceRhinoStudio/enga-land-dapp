import { concatAll, concatMap, delay, of, OperatorFunction, pipe, scan } from 'rxjs'
import { genArr } from '$lib/shared/utils/random'
import { MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import { BigNumber } from 'ethers'
import type { FilteredDataFetchControl } from './marketplace-types'
import type { NonUndefinable } from '$lib/types'
import { rndEndroItem } from '$lib/helpers/random/items'
import { EndroItemType } from '$lib/shared/types/enga'
import type { EndroItemMeta } from '$lib/types/enga'

export type CosmeticsFetchFilterKeys = never
export type CosmeticsFetchSortOptions = MarketplaceSortOptions

export function cosmeticsFetchFactory(
  filter: { [key in CosmeticsFetchFilterKeys]?: string | undefined } | undefined,
  sort: CosmeticsFetchSortOptions | undefined,
): OperatorFunction<NonUndefinable<FilteredDataFetchControl['Load']>, EndroItemMeta[]> {
  return pipe(
    delay(2000),
    concatMap(x => genArr(x.limit ?? 10, () => of(rndEndroItem(EndroItemType.cosmetics)))),
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
          return 0
        }),
      [] as EndroItemMeta[],
    ),
  )
}

export const cosmeticsFetchSortOptions: CosmeticsFetchSortOptions[] = [
  ..._.values(MarketplaceSortOptions),
]

export const cosmeticsFetchFilterOptions: {
  [key in CosmeticsFetchFilterKeys]: (string | undefined)[]
} = {}
