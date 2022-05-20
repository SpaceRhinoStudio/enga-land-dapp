import { config } from '$lib/configs'
import { Network } from '$lib/configs/web3'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { passUndefined } from '$lib/operators/pass-undefined'
import { catchError, distinctUntilChanged, map, mergeMap, Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'

type AbiResponse = {
  status: '0' | '1'
  message: string
  result: string
}

export function verifiedContractAbi$Factory(address: string): Observable<string | undefined> {
  return selectedNetwork$.pipe(
    mergeMap(network =>
      [Network.BSCMainnet, Network.BSCTestnet].includes(network)
        ? ajax<AbiResponse>({
            url: `https://api${network === Network.BSCTestnet ? '-testnet' : ''}.bscscan.com/api`,
            queryParams: `module=contract&action=getabi&address=${address}&apikey=${config.BscScanApiKey}`,
            method: 'GET',
          })
        : of(undefined),
    ),
    catchError(() => of(undefined)),
    passUndefined(map(res => (res.response.status === '1' ? res.response.result : undefined))),
    distinctUntilChanged(),
  )
}
