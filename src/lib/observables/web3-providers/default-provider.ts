import { config } from '$lib/configs'
import { getDefaultProvider } from '@ethers-ancillary/bsc'
import { catchError, EMPTY, from, map, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'

export const DefaultWeb3Provider$ = from(selectedNetwork$).pipe(
  map(x => getDefaultProvider(config.Chains[x].network)),
  catchError(() => EMPTY),
  shareReplay(1),
)
