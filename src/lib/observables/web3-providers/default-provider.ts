import { config } from '$lib/configs'
import { getDefaultProvider } from '@ethers-ancillary/bsc'
import { catchError, EMPTY, from, map, of, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { filterBy } from '$lib/operators/filter-by'
import _ from 'lodash'

/**
 * @description this contains the ethers default provider for the selected chain
 * it is unknown what the default provider would be but it works in some cases, and possibly it's the best to include it in the quorum of providers
 */
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
