import { Web3Errors } from '$lib/helpers/web3-errors'
import { isEnumMember } from '$lib/utils/enum'
import { providers } from 'ethers'
import { Observable, of } from 'rxjs'

export enum Network {
  BSCMainnet = 'bsc',
  BSCTestnet = 'bscTestnet',
  Local = 'localhost',
  Rinkeby = 'rinkeby',
  Polygon = 'polygon',
  Mumbai = 'polygonMumbai',
  Goerli = 'goerli',
}

export type Web3RegisteredListener = {
  provider: providers.ExternalProvider
  event: string
  listener: (...args: any[]) => void
}

export enum ActionStatus {
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  USELESS = 'USELESS',
  UNKNOWN = 'UNKNOWN',
}

export const isAction = isEnumMember(ActionStatus)

export type WithDeployBlock<T> = T & { deployedOn: number }

export type ConditionedAction<
  CanStatus =
    | true
    | ActionStatus.USELESS
    | Web3Errors.INVALID_PARAMS
    | Web3Errors.RESOURCE_NOT_FOUND
    | ActionStatus.FAILURE,
  CallReturn = ActionStatus.SUCCESS | ActionStatus.USELESS | ActionStatus.PENDING | Web3Errors,
> = {
  can$: Observable<CanStatus>
  call: () => Observable<CallReturn>
}

export const noopConditionedAction: ConditionedAction = {
  can$: of(Web3Errors.INVALID_PARAMS),
  call: () => of(Web3Errors.INVALID_PARAMS),
}
