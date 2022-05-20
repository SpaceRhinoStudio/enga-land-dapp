import type { PreSale } from 'engaland_fundraising_app/typechain'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { distinctUntilChanged, map, merge, type OperatorFunction, pipe, switchMap } from 'rxjs'

export enum PreSaleStatus {
  Pending = 0, // PreSale is idle and pending to be started
  Funding = 1, // PreSale has started and contributors can purchase tokens
  Refunding = 2, // PreSale has not reached goal within period and contributors can claim refunds
  GoalReached = 3, // PreSale has reached goal within period and trading is ready to be open
  Closed = 4, // PreSale has reached goal within period, has been closed and trading has been open
}

export const preSaleStatus: OperatorFunction<
  PreSale | undefined | null,
  PreSaleStatus | undefined | null
> = pipe(
  passNil(
    reEmitUntilChanged(x =>
      merge(fromEventFilter(x, x.filters.Close()), fromEventFilter(x, x.filters.SetOpenDate())),
    ),
    switchMap(x => x.state()),
    map(x => x as PreSaleStatus),
  ),
  distinctUntilChanged(),
)
