import { config } from '$lib/configs'
import { getDefaultProvider } from '@ethers-ancillary/bsc'
import { from, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import _ from 'lodash'
import { switchSome } from '$lib/operators/pass-undefined'
import { safeMap } from '$lib/operators/safe-throw'

/**
 * @description this contains the ethers default provider for the selected chain
 * it is unknown what the default provider would be but it works in some cases, and possibly it's the best to include it in the quorum of providers
 */
export const DefaultWeb3Provider$ = from(selectedNetwork$).pipe(
  switchSome(
    safeMap(x => getDefaultProvider(config.Chains[x].network), { silent: true, project: null }),
  ),
  shareReplay(1),
)
