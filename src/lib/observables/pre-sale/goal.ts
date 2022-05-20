import { PreSaleContract$ } from '../../../contracts/fundraising-contracts'
import { formatEther } from 'ethers/lib/utils'
import { passNil } from '$lib/operators/pass-undefined'
import { map, switchMap } from 'rxjs'

export const preSaleGoal$ = PreSaleContract$.pipe(
  passNil(
    switchMap(x => x.goal()),
    map(x => Number(formatEther(x))),
  ),
)
