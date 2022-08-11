import { Web3Errors } from '$lib/helpers/web3-errors'
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

export enum Web3ProviderId {
  metamask = 'metamask',
  binanceChain = 'binanceChain',
  trust = 'trust',
  safePal = 'safePal',
  walletConnect = 'walletConnect',
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

export type WithDeployBlock<T> = T & { deployedOn: number }

export type ConditionedAction<
  CanStatus =
    | true
    | ActionStatus.USELESS
    | Web3Errors.INVALID_PARAMS
    | Web3Errors.RESOURCE_NOT_FOUND
    | ActionStatus.FAILURE,
  CallReturn =
    | ActionStatus
    | Web3Errors.INVALID_PARAMS
    | Web3Errors.REJECTED
    | Web3Errors.RESOURCE_NOT_FOUND,
> = {
  can$: Observable<CanStatus>
  call: () => Observable<CallReturn>
}

export const noopConditionedAction: ConditionedAction = {
  can$: of(Web3Errors.INVALID_PARAMS),
  call: () => of(Web3Errors.INVALID_PARAMS),
}
