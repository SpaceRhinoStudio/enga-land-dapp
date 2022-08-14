import { Vesting } from '$lib/classes/vesting'
import { mapNil, switchSome } from '$lib/operators/pass-undefined'
import { toScanArray } from '$lib/operators/scan-array'
import { PreSale } from '$lib/services/presale'
import { SaleStatus } from '$lib/services/sale'
import { SeedSale } from '$lib/services/seedsale'
import { noUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'
import { Contract } from 'ethers'
import _ from 'lodash'
import { combineLatest, debounceTime, delay, map, mergeAll, Observable, startWith } from 'rxjs'

export const allSales = [SeedSale, PreSale] as const

export const allUserVestings$: Observable<Vesting<Contract>[] | undefined> = combineLatest(
  allSales.map(sale => sale.userVestings$),
).pipe(
  map(x => (x.some(_.isUndefined) ? undefined : x.filter(noUndefined))),
  switchSome(map(x => x.map(e => (e === null ? [] : e)))),
  switchSome(map(x => (x.every(e => !e.length) ? null : x))),
  switchSome(mergeAll(), mergeAll(), toScanArray()),
  mapNil(x => (x === null ? [] : x)),
  map(x => x?.sort((a, b) => Number(a.started) - Number(b.started))),
)

export const allSalesStatuses$ = combineLatest(
  allSales.map(sale => sale.status$.pipe(map(status => ({ sale, status })))),
)

export const availableSales$ = allSalesStatuses$.pipe(
  map(x =>
    x.filter(
      e => !_.isNil(e.status) && e.status > SaleStatus.Pending && e.status < SaleStatus.Closed,
    ),
  ),
  startWith([]),
)

export const isLoadingSalesInfo$ = allSalesStatuses$.pipe(
  map(x => {
    return x.some(e => _.isUndefined(e.status))
  }),
  debounceTime(500),
  startWith(true),
)

export const allSalesPending$ = allSalesStatuses$.pipe(
  map(x => {
    return x.every(e => e.status === SaleStatus.Pending)
  }),
  startWith(true),
)

export const allSalesNotFunding$ = allSalesStatuses$.pipe(
  map(x => {
    return x.every(e => e.status !== SaleStatus.Funding)
  }),
  startWith(true),
)
