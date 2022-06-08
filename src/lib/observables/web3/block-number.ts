import { noNil } from '$lib/utils/no-sentinel-or-undefined'
import { filter, from, of, switchMap } from 'rxjs'
import { fallbackWeb3Provider$ } from '../web3-providers/fallback-provider'

export const blockNumber$ = fallbackWeb3Provider$.pipe(
  filter(noNil),
  switchMap(x => (x.blockNumber > 0 ? of(x.blockNumber) : from(x.getBlockNumber()))),
)
