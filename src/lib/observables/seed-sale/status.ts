import { SeedSaleContract$ } from '../../../contracts/fundraising-contracts'
import { shareReplay } from 'rxjs'
import { seedSaleStatus } from '$lib/operators/seed-sale/status'

export const seedSaleStatus$ = SeedSaleContract$.pipe(seedSaleStatus, shareReplay(1))
