import { Observable, of } from 'rxjs'
import otherAbis from '../../contracts/other-abis.json'

type ContractAbiDefinitionType = { [contractName: string]: string }

export function externalContractAbi$Factory(
  contractGivenName: string,
): Observable<string | undefined> {
  return of((otherAbis as ContractAbiDefinitionType)[contractGivenName])
}
