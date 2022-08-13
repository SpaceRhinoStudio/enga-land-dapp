import { config } from '$lib/configs'
import { BscscanProvider } from '@ethers-ancillary/bsc'
import { filter, from, map, of, shareReplay } from 'rxjs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { switchSome } from '$lib/operators/pass-undefined'
import { safeMap, safeSwitchMap } from '$lib/operators/safe-throw'
import { Network } from '$lib/types'

/**@description this is a dedicated provider for BSC chain which uses bscScan APIs */
export const BscScanWeb3Provider$ = from(selectedNetwork$).pipe(
  filter(x => x === Network.BSCMainnet || x === Network.BSCTestnet),
  switchSome(
    safeMap(x => new BscscanProvider(config.Chains[x].network), { silent: true, project: null }),
    shareReplay(1),
  ),
)
