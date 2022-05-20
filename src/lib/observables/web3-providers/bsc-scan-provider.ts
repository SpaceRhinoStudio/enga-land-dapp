import { config } from '$lib/configs'
import { BscscanProvider } from '@ethers-ancillary/bsc'
import { Network } from '$lib/configs/web3'
import { catchError, EMPTY, filter, from, map, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'

export const BscScanWeb3Provider$ = from(selectedNetwork$).pipe(
  filter(x => x !== Network.Local),
  map(x => new BscscanProvider(config.Chains[x].network)),
  catchError(() => EMPTY),
  shareReplay(1),
)
