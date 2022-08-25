import { rndEndro } from '$lib/helpers/random/endro'
import { concatAll, concatMap, delay, map, OperatorFunction, pipe, scan } from 'rxjs'
import type { EndroMeta } from '$lib/types/enga'
import { genArr } from '$lib/shared/utils/random'
import { EndroSortOptions, MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import { BigNumber } from 'ethers'
import type { FilteredDataFetchControl } from './marketplace-types'
import type { NonUndefinable } from '$lib/types'

export type EndroFetchFilterKeys = 'gen'
export type EndroFetchSortOptions = EndroSortOptions | MarketplaceSortOptions

export function endroFetchFactory(
  filter: { [key in EndroFetchFilterKeys]?: string | undefined } | undefined,
  sort: EndroFetchSortOptions | undefined,
): OperatorFunction<NonUndefinable<FilteredDataFetchControl['Load']>, EndroMeta[]> {
  return pipe(
    delay(2000),
    concatMap(x =>
      genArr(x.limit ?? 10, () => rndEndro()).map(x =>
        !_.isUndefined(filter?.gen) ? x.pipe(map(x => ({ ...x, gen: parseInt(filter!.gen!) }))) : x,
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
  )
}

export const endroFetchSortOptions: EndroFetchSortOptions[] = [
  ..._.values(MarketplaceSortOptions),
  ..._.values(EndroSortOptions),
]

export const endroFetchFilterOptions: {
  [key in EndroFetchFilterKeys]: (string | undefined)[]
} = { gen: [undefined, ...genArr(15, e => `${e + 1}`)] }
