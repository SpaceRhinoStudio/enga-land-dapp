import { SeedSaleContract$ } from '../../../contracts/fundraising-contracts'
import { formatEther } from 'ethers/lib/utils'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { map, mergeMap } from 'rxjs'

export const seedSaleTotalCollateralRaised$ = SeedSaleContract$.pipe(
  passNil(
    reEmitUntilChanged(x => fromEventFilter(x, x.filters.VestingCreated())),
    mergeMap(x => x.totalRaised()),
    map(x => Number(formatEther(x))),
  ),
)
