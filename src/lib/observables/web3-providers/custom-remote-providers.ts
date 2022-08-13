import { config } from '$lib/configs'
import { providers } from 'ethers'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { from, map, shareReplay } from 'rxjs'
import { switchSome } from '$lib/operators/pass-undefined'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import _ from 'lodash'

/**
 * @description this observable contains a set of custom JSONRPC providers for the selected network based on the endpoints defined in the web3 config
 * this is useful for when there is no web3 injected provider available.
 */
export const CustomRemoteWeb3Providers$ = from(selectedNetwork$).pipe(
  switchSome(
    map(x => config.CustomEndpoints[x]),
    map(x =>
      x
        .map(endpoint => {
          try {
            return new providers.JsonRpcProvider(endpoint)
          } catch (e) {
            return null
          }
        })
        .filter(noNil),
    ),
  ),
  shareReplay(1),
)
