import { config } from '$lib/configs'
import { getDefaultProvider } from '@ethers-ancillary/bsc'
import { catchError, EMPTY, from, map, of, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { filterBy } from '$lib/operators/filter-by'
import _ from 'lodash'

export const DefaultWeb3Provider$ = from(selectedNetwork$).pipe(
  map(x => getDefaultProvider(config.Chains[x].network)),
  catchError(() => EMPTY),
  filterBy(x =>
    (_.get(x, 'blockNumber') ?? 0) > 0
      ? of(true)
      : from(x.getBlockNumber()).pipe(map(n => (n > 0 ? true : false))),
  ),
  shareReplay(1),
)
