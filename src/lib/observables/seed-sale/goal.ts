import { SeedSaleContract$ } from '../../../contracts/fundraising-contracts'
import { formatEther } from 'ethers/lib/utils'
import { passNil } from '$lib/operators/pass-undefined'
import { map, switchMap } from 'rxjs'

export const seedSaleGoal$ = SeedSaleContract$.pipe(
  passNil(
    switchMap(x => x.daiGoal()),
    map(x => Number(formatEther(x))),
  ),
)
