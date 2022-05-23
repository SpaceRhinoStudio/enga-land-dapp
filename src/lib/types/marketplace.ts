import { keysOf } from '$lib/utils/type-safe'

export enum MarketplaceSortOptions {
  'latest' = 'latest',
  'cheap' = 'cheap',
  'expensive' = 'expensive',
}

/**@description why object you might ask, because TS won't let you miss a key! */
const MarketplaceSortOptionsTypeSafeKeys: {
  [key in MarketplaceSortOptions]: MarketplaceSortOptions
} = {
  [MarketplaceSortOptions.latest]: MarketplaceSortOptions.latest,
  [MarketplaceSortOptions.cheap]: MarketplaceSortOptions.cheap,
  [MarketplaceSortOptions.expensive]: MarketplaceSortOptions.expensive,
}
export const MarketplaceSortOptionsArray: MarketplaceSortOptions[] = keysOf(
  MarketplaceSortOptionsTypeSafeKeys,
)

export enum EndroSortOptions {
  'lowerGeneration' = 'lowerGeneration',
  'higherGeneration' = 'higherGeneration',
}

const EndroSortOptionsTypeSafeKeys: {
  [key in EndroSortOptions]: EndroSortOptions
} = {
  [EndroSortOptions.lowerGeneration]: EndroSortOptions.lowerGeneration,
  [EndroSortOptions.higherGeneration]: EndroSortOptions.higherGeneration,
}
export const EndroSortOptionsArray: EndroSortOptions[] = keysOf(EndroSortOptionsTypeSafeKeys)
