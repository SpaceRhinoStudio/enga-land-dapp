import { config } from '$lib/configs'
import { BscscanProvider } from '@ethers-ancillary/bsc'
import { Network } from '$lib/configs/web3'
import { catchError, EMPTY, filter, from, map, of, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { filterBy } from '$lib/operators/filter-by'

export const BscScanWeb3Provider$ = from(selectedNetwork$).pipe(
  filter(x => x !== Network.Local),
  map(x => new BscscanProvider(config.Chains[x].network)),
  catchError(() => EMPTY),
  filterBy(x =>
    x.blockNumber > 0 ? of(true) : from(x.getBlockNumber()).pipe(map(n => (n > 0 ? true : false))),
  ),
  shareReplay(1),
)
