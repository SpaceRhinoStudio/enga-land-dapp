import type { SeedSale } from 'engaland_fundraising_app/typechain'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import {
  distinctUntilChanged,
  map,
  merge,
  type OperatorFunction,
  pipe,
  switchMap,
  catchError,
  of,
  from,
  combineLatest,
} from 'rxjs'
import type { Nil } from '$lib/types'
import { seedSaleGoal$ } from '$lib/observables/seed-sale/goal'
import { withUpdatesUntilChanged } from '../with-updates-from'
import { seedSaleTotalCollateralRaised$ } from '$lib/observables/seed-sale/raised'

export enum SeedSaleStatus {
  Pending = 0,
  Funding = 1,
  GoalReached = 3,
}

export const seedSaleStatus: OperatorFunction<SeedSale | Nil, SeedSaleStatus | Nil> = pipe(
  passNil(
    reEmitUntilChanged(x => merge(fromEventFilter(x, x.filters.SaleOpened()))),
    switchMap(x =>
      combineLatest({
        isOpen: from(x.isOpen()),
        goalReached: seedSaleGoal$.pipe(
          withUpdatesUntilChanged(seedSaleTotalCollateralRaised$),
          map(([goal, raised]) => !((raised ?? 0) < (goal ?? 0))),
        ),
      }),
    ),
    map(({ isOpen, goalReached }) =>
      !isOpen
        ? SeedSaleStatus.Pending
        : goalReached
        ? SeedSaleStatus.GoalReached
        : SeedSaleStatus.Funding,
    ),
  ),
  catchError(() => of(null)),
  distinctUntilChanged(),
)
