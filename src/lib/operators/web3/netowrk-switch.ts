import { config } from '$lib/configs'
import { flashToast$, ToastLevel } from '$lib/shared/contexts/flash-toast'
import { ActionStatus, Network, Option$, Web3ProviderId } from '$lib/types'
import { Web3ProviderMetadata } from '$lib/types/rxjs'
import { providers } from 'ethers'
import _ from 'lodash'
import {
  from,
  map,
  Observable,
  of,
  switchMap,
  catchError,
  combineLatest,
  first,
  startWith,
  filter,
  timeout,
  ObservableInput,
  EMPTY,
} from 'rxjs'
import { mapNil, switchSome } from '../pass-undefined'
import { inferWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'
import { combineLatestSwitchMap } from '../combine-latest-switch'
import { mapIndex } from '../operate-on-tuple'
import { safeSwitchMap } from '../safe-throw'
import { mapToNetwork } from './network'
import { noUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'

export type NetworkSwitchState =
  | ActionStatus.FAILURE
  | Web3Errors.REJECTED
  | ActionStatus.UNKNOWN
  | Web3Errors.RESOURCE_UNAVAILABLE

const promiseWrapper = (input: unknown): Observable<NetworkSwitchState> =>
  from(Promise.resolve(input)).pipe(map(() => ActionStatus.UNKNOWN as const))

const promiseWrapperCatch = (e: unknown) => {
  console.warn(e)
  const error = inferWeb3Error(e)
  return error && [Web3Errors.REJECTED, Web3Errors.RESOURCE_UNAVAILABLE].includes(error)
    ? of(error as Web3Errors.REJECTED | Web3Errors.RESOURCE_UNAVAILABLE)
    : of(ActionStatus.FAILURE as const)
}

const promiseWrapperWithCatch = (input: unknown) =>
  promiseWrapper(input).pipe(catchError(promiseWrapperCatch))

/**@description binanceChain wallet has a custom network switch method with limited functionality */
const networkSwitchBinanceWallet = (provider: providers.Web3Provider) => (network: Network) => {
  const binance = provider.provider as providers.ExternalProvider & {
    switchNetwork: (networkId: string) => Promise<void>
  }
  if (network === Network.BSCMainnet) {
    return promiseWrapperWithCatch(binance.switchNetwork('bsc-mainnet'))
  } else if (network === Network.BSCTestnet) {
    return promiseWrapperWithCatch(binance.switchNetwork('bsc-testnet'))
  }

  console.error('E0x05 BinanceChainWallet only supports switching to mainnet and testnet')
  flashToast$.next({
    level: ToastLevel.ERROR,
    //TODO: tl
    message: 'BinanceChainWallet only supports BSC Mainnet and BSC Testnet',
    timeout: 2000,
  })
  return of(ActionStatus.FAILURE as const)
}

const networkSwitchEIP3326 = (provider: providers.Web3Provider) => (network: Network) => {
  return from(
    promiseWrapper(
      provider.send('wallet_switchEthereumChain', [
        { chainId: config.Chains[network].config.chainId },
      ]),
    ),
  ).pipe(
    catchError(e => {
      if (inferWeb3Error(e) === Web3Errors.UNKNOWN_CHAIN) {
        return promiseWrapperWithCatch(
          provider.send('wallet_addEthereumChain', [config.Chains[network].config]),
        )
      } else {
        return promiseWrapperCatch(e)
      }
    }),
  )
}

export function switchNetwork(
  meta$: Option$<Web3ProviderMetadata>,
): (
  network$: Option$<Network>,
) => Observable<
  | ActionStatus.FAILURE
  | Web3Errors.REJECTED
  | Web3Errors.RESOURCE_NOT_FOUND
  | Web3Errors.RESOURCE_UNAVAILABLE
  | Web3Errors.INVALID_PARAMS
  | ActionStatus.PENDING
  | ActionStatus.SUCCESS
> {
  const method$ = meta$.pipe(
    switchSome(
      combineLatestSwitchMap(meta => meta.web3Provider$),
      mapIndex('0', meta => of(meta.id)),
      map(([id, provider]) =>
        id === Web3ProviderId.binanceChain
          ? networkSwitchBinanceWallet(provider)
          : networkSwitchEIP3326(provider),
      ),
    ),
  )
  return network$ => {
    return combineLatest([method$, network$]).pipe(
      first(),
      safeSwitchMap(
        ([f, network]) =>
          (_.isUndefined(f) || _.isUndefined(network)
            ? of(Web3Errors.RESOURCE_NOT_FOUND as const)
            : _.isNull(f) || _.isNull(network)
            ? of(Web3Errors.INVALID_PARAMS as const)
            : f(network).pipe(
                first(),
                startWith(ActionStatus.PENDING as const),
                switchMap(x =>
                  x === ActionStatus.UNKNOWN
                    ? meta$.pipe(
                        switchSome(
                          mapToNetwork,
                          filter(metaNetwork => network === metaNetwork),
                          first(),
                          map(() => ActionStatus.SUCCESS as const),
                          timeout({ first: 1000 }),
                          catchError(() => of(ActionStatus.FAILURE as const)),
                        ),
                        mapNil(() => Web3Errors.INVALID_PARAMS as const),
                      )
                    : of(x),
                ),
              )) as ObservableInput<
            | ActionStatus.FAILURE
            | Web3Errors.REJECTED
            | Web3Errors.RESOURCE_NOT_FOUND
            | Web3Errors.RESOURCE_UNAVAILABLE
            | Web3Errors.INVALID_PARAMS
            | ActionStatus.PENDING
            | ActionStatus.SUCCESS
          >,
        { silent: true, project: ActionStatus.FAILURE },
      ),
    )
  }
}
