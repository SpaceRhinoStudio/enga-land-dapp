import { concatAll, concatMap, delay, of, OperatorFunction, pipe, scan } from 'rxjs'
import { GodStats } from '$lib/shared/types/enga'
import { genArr, rnd, rndPick } from '$lib/shared/utils/random'
import { MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import { BigNumber } from 'ethers'
import type { FilteredDataFetchControl } from './marketplace-types'
import type { NonUndefinable } from '$lib/types'
import { rndEndroItem } from '$lib/helpers/random/items'
import { EndroItemType } from '$lib/shared/types/enga'
import { keysOf } from '$lib/shared/utils/type-safe'
import type { EndroItemMeta } from '$lib/types/enga'

export type ChipsetFetchFilterKeys = 'modifier'
export type ChipsetFetchSortOptions = MarketplaceSortOptions | 'higherTotal' | 'lowerTotal'

export function chipsetFetchFactory(
  filter: { [key in ChipsetFetchFilterKeys]?: string | undefined } | undefined,
  sort: ChipsetFetchSortOptions | undefined,
): OperatorFunction<NonUndefinable<FilteredDataFetchControl['Load']>, EndroItemMeta[]> {
  return pipe(
    delay(2000),
    concatMap(x =>
      genArr(x.limit ?? 10, () =>
        of(
          rndEndroItem(
            EndroItemType.chipset,
            undefined,
            undefined,
            //@ts-ignore
            _.isUndefined(filter?.modifier)
              ? undefined
              : //@ts-ignore
                Array.from(
                  new Set(
                    rndPick(keysOf(GodStats), rnd(6) + 1).concat(filter!.modifier.toLowerCase()),
                  ),
                ),
          ),
        ),
      ),
    ),
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
          if (sort === 'higherTotal') {
            return (
              _.values(b.modifiers).reduce((acc, x) => acc + x, 0) -
              _.values(a.modifiers).reduce((acc, x) => acc + x, 0)
            )
          }
          if (sort === 'lowerTotal') {
            return (
              _.values(a.modifiers).reduce((acc, x) => acc + x, 0) -
              _.values(b.modifiers).reduce((acc, x) => acc + x, 0)
            )
          }
          return 0
        }),
      [] as EndroItemMeta[],
    ),
  )
}

export const chipsetFetchSortOptions: ChipsetFetchSortOptions[] = [
  ..._.values(MarketplaceSortOptions),
  'higherTotal',
  'lowerTotal',
]

export const chipsetFetchFilterOptions: {
  [key in ChipsetFetchFilterKeys]: (string | undefined)[]
} = { modifier: [undefined, ..._.values(GodStats).map(x => x.toUpperCase())] }
