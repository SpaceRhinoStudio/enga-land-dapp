import { SeedSaleContract$ } from '../../../contracts/fundraising-contracts'
import { passNil } from '$lib/operators/pass-undefined'
import { map, switchMap } from 'rxjs'
import { utils } from 'ethers'

export const seedSaleGoal$ = SeedSaleContract$.pipe(
  passNil(
    switchMap(x => x.daiGoal()),
    map(x => Number(utils.formatEther(x))),
  ),
)
