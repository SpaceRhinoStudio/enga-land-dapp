/**
 * @description ENGA token balance as a single central observable for everyone to use.
 */

import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
import { switchSome } from '$lib/operators/pass-undefined'
import { userBalanceOf$$ } from '$lib/operators/web3/balance-of'
import { map, shareReplay } from 'rxjs'
import { EngaTokenContract$ } from '../../../contracts/fundraising-contracts'

export const engaBalanceRaw$ = userBalanceOf$$(EngaTokenContract$).pipe(shareReplay(1))

export const engaBalance$ = engaBalanceRaw$.pipe(
  switchSome(map(formatCurrencyWithUnit)),
  shareReplay(1),
)
