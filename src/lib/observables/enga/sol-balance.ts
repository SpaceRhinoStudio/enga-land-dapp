import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
import { passNil } from '$lib/operators/pass-undefined'
import { BigNumber } from 'ethers'
import { delay, of, shareReplay, map } from 'rxjs'

//DEBUG //TODO: implement
export const solBalanceRaw$ = of(BigNumber.from(0)).pipe(delay(2000), shareReplay(1))

export const solBalance$ = solBalanceRaw$.pipe(passNil(map(formatCurrencyWithUnit)), shareReplay(1))