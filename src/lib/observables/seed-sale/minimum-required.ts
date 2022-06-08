import { SeedSaleContract$ } from '../../../contracts/fundraising-contracts'
import { passNil } from '$lib/operators/pass-undefined'
import { mergeMap, shareReplay } from 'rxjs'

export const seedSaleMinimumRequiredTargetCollateral$ = SeedSaleContract$.pipe(
  passNil(mergeMap(x => x.minimumRequiredToken())),
  shareReplay(1),
)
