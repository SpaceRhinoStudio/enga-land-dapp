import { map, Observable } from 'rxjs'
import otherAbis from '../../contracts/other-abis.json'
import type { Network } from '$lib/configs/web3'
import { selectedNetwork$ } from '$lib/observables/web3-network'

type ContractAbiDefinitionType = {
  [key in Network]?: { [contractName: string]: string }
}

export function externalContractAbi$Factory(
  contractGivenName: string,
): Observable<string | undefined> {
  return selectedNetwork$.pipe(
    map(x => (otherAbis as ContractAbiDefinitionType)[x]?.[contractGivenName]),
  )
}
