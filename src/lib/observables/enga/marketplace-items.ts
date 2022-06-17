import { controlStreamPayload } from '$lib/operators/control-stream-payload'
import { map, Observable, OperatorFunction, startWith, Subject, tap } from 'rxjs'
import { MarketplaceSortOptions } from '$lib/shared/types/marketplace'
import _ from 'lodash'
import type { FilteredDataFetchControl } from './marketplace-types'
import {
  endroFetchFactory,
  endroFetchSortOptions,
  endroFetchFilterOptions,
  EndroFetchFilterKeys,
} from './endro-marketplace'
import { Routes } from '$lib/shared/configs/routes'
import type { ValueTypeUnion } from '$lib/types'
import {
  opifexIndexedFetchFactory,
  OpifexIndexedFetchFilterKeys,
  opifexIndexedFetchFilterOptions,
  opifexIndexedFetchSortOptions,
  opifexOffFetchFactory,
  OpifexOffFetchFilterKeys,
  opifexOffFetchFilterOptions,
  opifexOffFetchSortOptions,
} from './opifex-marketplace'
import {
  cosmeticsFetchFactory,
  CosmeticsFetchFilterKeys,
  cosmeticsFetchFilterOptions,
  cosmeticsFetchSortOptions,
} from './cosmetics-marketplace'
import {
  chipsetFetchFactory,
  ChipsetFetchFilterKeys,
  chipsetFetchFilterOptions,
  chipsetFetchSortOptions,
} from './chipset-marketplace'

export type MarketplaceItemsType =
  | Routes.mpEndro
  | Routes.mpOpifexOff
  | Routes.mpOpifexIndexed
  | Routes.mpCosmetics
  | Routes.mpChipset
  | Routes.mpConsumable
  | Routes.mpAccoutrements
  | Routes.mpSkins
  | Routes.mpTickets
  | Routes.mpListings
  | Routes.mpSales
  | Routes.mpPurchases

export const marketplaceSortOptions = {
  [Routes.mpEndro]: endroFetchSortOptions,
  [Routes.mpOpifexOff]: opifexOffFetchSortOptions,
  [Routes.mpOpifexIndexed]: opifexIndexedFetchSortOptions,
  [Routes.mpCosmetics]: cosmeticsFetchSortOptions,
  [Routes.mpChipset]: chipsetFetchSortOptions,
  // [Routes.mpConsumable]: consumableFetchSortOptions,
  // [Routes.mpAccoutrements]: accoutrementsFetchSortOptions,
  // [Routes.mpSkins]: skinsFetchSortOptions,
  // [Routes.mpTickets]: ticketsFetchSortOptions,
  // [Routes.mpListings]: listingsFetchSortOptions,
  // [Routes.mpSales]: salesFetchSortOptions,
  // [Routes.mpPurchases]: purchasesFetchSortOptions,

  [Routes.mpConsumable]: _.values(MarketplaceSortOptions),
  [Routes.mpAccoutrements]: _.values(MarketplaceSortOptions),
  [Routes.mpSkins]: _.values(MarketplaceSortOptions),
  [Routes.mpTickets]: _.values(MarketplaceSortOptions),
  [Routes.mpListings]: _.values(MarketplaceSortOptions),
  [Routes.mpSales]: _.values(MarketplaceSortOptions),
  [Routes.mpPurchases]: _.values(MarketplaceSortOptions),
}

export type MarketplaceFilterKeys =
  | EndroFetchFilterKeys
  | OpifexOffFetchFilterKeys
  | OpifexIndexedFetchFilterKeys
  | CosmeticsFetchFilterKeys
  | ChipsetFetchFilterKeys
// | ConsumableFetchFilterKeys
// | AccoutrementsFetchFilterKeys
// | SkinsFetchFilterKeys
// | TicketsFetchFilterKeys
// | ListingsFetchFilterKeys
// | SalesFetchFilterKeys
// | PurchasesFetchFilterKeys

export type MarketplaceFilterType =
  | { [key in EndroFetchFilterKeys]?: string | undefined }
  | { [key in OpifexOffFetchFilterKeys]?: string | undefined }
  | { [key in OpifexIndexedFetchFilterKeys]?: string | undefined }
  | { [key in CosmeticsFetchFilterKeys]?: string | undefined }
  | { [key in ChipsetFetchFilterKeys]?: string | undefined }
// | { [key in ConsumableFetchFilterKeys]?: string | undefined }
// | { [key in AccoutrementsFetchFilterKeys]?: string | undefined }
// | { [key in SkinsFetchFilterKeys]?: string | undefined }
// | { [key in TicketsFetchFilterKeys]?: string | undefined }
// | { [key in ListingsFetchFilterKeys]?: string | undefined }
// | { [key in SalesFetchFilterKeys]?: string | undefined }
// | { [key in PurchasesFetchFilterKeys]?: string | undefined }

export const marketplaceFilterOptions = {
  [Routes.mpEndro]: endroFetchFilterOptions,
  [Routes.mpOpifexOff]: opifexOffFetchFilterOptions,
  [Routes.mpOpifexIndexed]: opifexIndexedFetchFilterOptions,
  [Routes.mpCosmetics]: cosmeticsFetchFilterOptions,
  [Routes.mpChipset]: chipsetFetchFilterOptions,
  // [Routes.mpConsumable]: consumableFetchFilterOptions,
  // [Routes.mpAccoutrements]: accoutrementsFetchFilterOptions,
  // [Routes.mpSkins]: skinsFetchFilterOptions,
  // [Routes.mpTickets]: ticketsFetchFilterOptions,
  // [Routes.mpListings]: listingsFetchFilterOptions,
  // [Routes.mpSales]: salesFetchFilterOptions,
  // [Routes.mpPurchases]: purchasesFetchFilterOptions,

  [Routes.mpConsumable]: {},
  [Routes.mpAccoutrements]: {},
  [Routes.mpSkins]: {},
  [Routes.mpTickets]: {},
  [Routes.mpListings]: {},
  [Routes.mpSales]: {},
  [Routes.mpPurchases]: {},
}

type InferOperatorOutput<O> = O extends OperatorFunction<any, infer T> ? T : never

const marketplaceFetchFactories = {
  [Routes.mpEndro]: endroFetchFactory,
  [Routes.mpOpifexOff]: opifexOffFetchFactory,
  [Routes.mpOpifexIndexed]: opifexIndexedFetchFactory,
  [Routes.mpCosmetics]: cosmeticsFetchFactory,
  [Routes.mpChipset]: chipsetFetchFactory,
  // [Routes.mpConsumable]: consumableFetchFactory,
  // [Routes.mpAccoutrements]: accoutrementsFetchFactory,
  // [Routes.mpSkins]: skinsFetchFactory,
  // [Routes.mpTickets]: ticketsFetchFactory,
  // [Routes.mpListings]: listingsFetchFactory,
  // [Routes.mpSales]: salesFetchFactory,
  // [Routes.mpPurchases]: purchasesFetchFactory,

  [Routes.mpConsumable]: () => map(() => []),
  [Routes.mpAccoutrements]: () => map(() => []),
  [Routes.mpSkins]: () => map(() => []),
  [Routes.mpTickets]: () => map(() => []),
  [Routes.mpListings]: () => map(() => []),
  [Routes.mpSales]: () => map(() => []),
  [Routes.mpPurchases]: () => map(() => []),
}

export function marketplaceItems$Factory<T extends MarketplaceItemsType>(
  type: T,
  filter: MarketplaceFilterType | undefined,
  sort: ValueTypeUnion<typeof marketplaceSortOptions>[number] = MarketplaceSortOptions.latest,
): [
  controller$: Subject<FilteredDataFetchControl>,
  items$: Observable<
    InferOperatorOutput<ReturnType<typeof marketplaceFetchFactories[T]>> | undefined
  >,
] {
  const fetchFactory = marketplaceFetchFactories[type]
  const controller$ = new Subject<FilteredDataFetchControl>()

  const items$ = controller$.pipe(
    controlStreamPayload('Load'),
    tap(() => controller$.next({ isLoading: true })),
    fetchFactory(filter, sort),
    tap(() => controller$.next({ isLoading: false })),
    startWith(undefined),
  )

  return [controller$, items$]
}
