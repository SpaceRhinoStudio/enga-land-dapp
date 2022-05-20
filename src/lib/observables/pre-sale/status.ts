import { PreSaleContract$ } from '../../../contracts/fundraising-contracts'
import { shareReplay } from 'rxjs'
import { preSaleStatus } from '../../operators/pre-sale/status'

export const preSaleStatus$ = PreSaleContract$.pipe(preSaleStatus, shareReplay(1))
