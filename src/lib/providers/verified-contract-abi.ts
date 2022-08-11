import { config } from '$lib/configs'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { switchSome } from '$lib/operators/pass-undefined'
import { Network, Option$ } from '$lib/types'
import { catchError, distinctUntilChanged, exhaustMap, map, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'

type AbiResponse = {
  status: '0' | '1'
  message: string
  result: string
}

export function verifiedContractAbi$Factory(address: string): Option$<string> {
  return selectedNetwork$.pipe(
    switchSome(
      exhaustMap(network =>
        [Network.BSCMainnet, Network.BSCTestnet].includes(network)
          ? ajax<AbiResponse>({
              url: `https://api${network === Network.BSCTestnet ? '-testnet' : ''}.bscscan.com/api`,
              queryParams: `module=contract&action=getabi&address=${address}&apikey=${config.BscScanApiKey}`,
              method: 'GET',
            }).pipe(catchError(() => of(undefined)))
          : of(undefined),
      ),
    ),
    switchSome(map(res => (res.response.status === '1' ? res.response.result : undefined))),
    distinctUntilChanged(),
  )
}
