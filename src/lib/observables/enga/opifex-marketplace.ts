import { concatAll, concatMap, delay, map, OperatorFunction, pipe, scan } from 'rxjs'
import type { OpifexMeta } from '$lib/types/enga'
import { genArr } from '$lib/shared/utils/random'
import { MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import { BigNumber } from 'ethers'
import type { FilteredDataFetchControl } from './marketplace-types'
import type { NonUndefinable } from '$lib/types'
import { rndOpifexIndexed, rndOpifexOff } from '$lib/helpers/random/opifex'

export type OpifexOffFetchFilterKeys = never
export type OpifexIndexedFetchFilterKeys = 'avgGen'

export enum OpifexSortOptions {
  'lowerGeneration' = 'lowerGeneration',
  'higherGeneration' = 'higherGeneration',
}

export type OpifexOffFetchSortOptions = MarketplaceSortOptions
export type OpifexIndexedFetchSortOptions = OpifexSortOptions | MarketplaceSortOptions

export function opifexOffFetchFactory(
  filter: { [key in OpifexOffFetchFilterKeys]?: string | undefined } | undefined,
  sort: OpifexOffFetchSortOptions | undefined,
): OperatorFunction<NonUndefinable<FilteredDataFetchControl['Load']>, OpifexMeta[]> {
  return pipe(
    delay(2000),
    concatMap(x =>
      genArr(x.limit ?? 10, () => rndOpifexOff()).map(x =>
        !_.isUndefined(filter?.avgGen)
          ? x.pipe(map(x => ({ ...x, avgGen: parseInt(filter!.avgGen!) })))
          : x,
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
          if (sort === OpifexSortOptions.higherGeneration) {
            return b.generation - a.generation
          }
          if (sort === OpifexSortOptions.lowerGeneration) {
            return a.generation - b.generation
          }
          return 0
        }),
      [] as OpifexMeta[],
    ),
  )
}

export function opifexIndexedFetchFactory(
  filter: { [key in OpifexOffFetchFilterKeys]?: string | undefined } | undefined,
  sort: OpifexOffFetchSortOptions | undefined,
): OperatorFunction<NonUndefinable<FilteredDataFetchControl['Load']>, OpifexMeta[]> {
  return pipe(
    delay(3000),
    concatMap(x =>
      genArr(x.limit ?? 10, () => rndOpifexIndexed()).map(x =>
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
          if (sort === OpifexSortOptions.higherGeneration) {
            return b.generation - a.generation
          }
          if (sort === OpifexSortOptions.lowerGeneration) {
            return a.generation - b.generation
          }
          return 0
        }),
      [] as OpifexMeta[],
    ),
  )
}

export const opifexOffFetchSortOptions: OpifexOffFetchSortOptions[] = [
  ..._.values(MarketplaceSortOptions),
]
export const opifexIndexedFetchSortOptions: OpifexIndexedFetchSortOptions[] = [
  ..._.values(MarketplaceSortOptions),
  ..._.values(OpifexSortOptions),
]

export const opifexOffFetchFilterOptions: {
  [key in OpifexOffFetchFilterKeys]: (string | undefined)[]
} = {}

export const opifexIndexedFetchFilterOptions: {
  [key in OpifexIndexedFetchFilterKeys]: (string | undefined)[]
} = { avgGen: [undefined, ...genArr(15, e => `${e + 1}`)] }
