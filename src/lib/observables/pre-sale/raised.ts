import { PreSaleContract$ } from '../../../contracts/fundraising-contracts'
import { passNil } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import { map, mergeMap } from 'rxjs'
import { utils } from 'ethers'

export const preSaleTotalCollateralRaised$ = PreSaleContract$.pipe(
  passNil(
    reEmitUntilChanged(x => fromEventFilter(x, x.filters.Contribute())),
    mergeMap(x => x.totalRaised()),
    map(x => Number(utils.formatEther(x))),
  ),
)
