import { MarketMakerContract$ } from '../../../contracts/fundraising-contracts'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { retry, shareReplay, skip, switchMap, take } from 'rxjs'

export const marketMakerStatus$ = MarketMakerContract$.pipe(
  passNil(
    reEmitUntilChanged(x => fromEventFilter(x, x.filters.Open())),
    switchMap(x => x.isOpen()),
  ),
  retry({ delay: () => MarketMakerContract$.pipe(skip(1), take(1)) }),
  shareReplay(1),
)
