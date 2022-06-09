import { PreSaleContract$ } from '../../../contracts/fundraising-contracts'
import { passNil } from '$lib/operators/pass-undefined'
import { map, switchMap } from 'rxjs'
import { utils } from 'ethers'

export const preSaleGoal$ = PreSaleContract$.pipe(
  passNil(
    switchMap(x => x.goal()),
    map(x => Number(utils.formatEther(x))),
  ),
)
