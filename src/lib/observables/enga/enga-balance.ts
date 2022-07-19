import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
import { passNil } from '$lib/operators/pass-undefined'
import { signerBalanceOf } from '$lib/operators/web3/balance-of'
import { map, shareReplay } from 'rxjs'
import { EngaTokenContract$ } from '../../../contracts/fundraising-contracts'

export const engaBalanceRaw$ = EngaTokenContract$.pipe(signerBalanceOf, shareReplay(1))

export const engaBalance$ = engaBalanceRaw$.pipe(
  passNil(map(formatCurrencyWithUnit)),
  shareReplay(1),
)
