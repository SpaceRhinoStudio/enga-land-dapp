import { config } from '$lib/configs'
import { Network } from '$lib/configs/web3'
import { isNotSentinel, SENTINEL } from '$lib/shared/contexts/empty-sentinel'
import _ from 'lodash'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  mergeMap,
  mergeWith,
  of,
  type OperatorFunction,
  pipe,
  switchMap,
  withLatestFrom,
} from 'rxjs'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import type EventEmitter from 'events'
import { safeThrowMergeMap } from '$lib/operators/safe-throw'
import { web3Signer } from './signer'
import { withUpdatesFrom } from '$lib/operators/with-updates-from'
import { selectedNetwork$ } from '$lib/observables/web3-network'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import type { providers } from 'ethers'

export const web3ProviderChainIdChangeTrigger: OperatorFunction<Web3ProviderMetadata, true> = pipe(
  switchMap(x => x.web3Provider$),
  switchMap(x =>
    merge(
      fromEvent(x.provider as EventEmitter, 'chainChanged'),
      fromEvent(x.provider as EventEmitter, 'networkChanged'),
    ).pipe(
      map(() => true as const),
      debounceTime(10),
    ),
  ),
)

export const web3ProviderChainId: OperatorFunction<Web3ProviderMetadata, number | undefined> = pipe(
  reEmitUntilChanged(x => of(x).pipe(web3ProviderChainIdChangeTrigger)),
  web3Signer,
  safeThrowMergeMap(signer => signer?.getChainId()),
  catchError((_, observable) => of(undefined).pipe(mergeWith(observable))),
)

function catchAlreadyInProgress(e: any) {
  if (_.get(e, 'code') == -32002) {
    // already in progress
    return SENTINEL
  }
  return false
}

export const requestChainIdCorrection: OperatorFunction<Web3ProviderMetadata, undefined> = pipe(
  x$ =>
    x$.pipe(
      switchMap(x => x.chainId$),
      withLatestFrom(x$), //FIX code smell
      distinctUntilChanged((prev, x) => prev[0] === x[0] && prev[1]?.id === x[1]?.id),
      map(([, x]) => x),
    ),
  switchMap(x => x.web3Provider$.pipe(map(provider => [x, provider] as const))),

  withUpdatesFrom(selectedNetwork$),
  mergeMap(([[meta, provider], network]) => {
    if (
      meta.id === 'binanceChain' &&
      'switchNetwork' in provider.provider &&
      _.isFunction(_.get(provider.provider, 'switchNetwork'))
    ) {
      /**@description binanceChain wallet has a custom network switch method with limited functionality */
      const binance = provider.provider as providers.ExternalProvider & {
        switchNetwork: (networkId: string) => Promise<void>
      }
      try {
        if (network === Network.BSCMainnet) {
          return binance
            .switchNetwork('bsc-mainnet')
            .then(() => true)
            .catch(catchAlreadyInProgress)
        } else if (network === Network.BSCTestnet) {
          return binance
            .switchNetwork('bsc-testnet')
            .then(() => true)
            .catch(catchAlreadyInProgress)
        }
      } catch (e) {
        console.error(e)
        return of(false)
      }
      console.error('E0x05 BinanceChainWallet only supports switching to mainnet and testnet')
      return of(false)
    }
    try {
      return (
        provider.send('wallet_addEthereumChain', [config.Chains[network].config]) as Promise<null>
      )
        .catch(catchAlreadyInProgress)
        .then(
          () =>
            provider.send('wallet_switchEthereumChain', [
              { chainId: config.Chains[network].config.chainId },
            ]) as Promise<null>,
        )
        .then(() => true)
        .catch(catchAlreadyInProgress)
    } catch (e) {
      console.error(e)
      return of(false)
    }
  }),

  filter(isNotSentinel),

  map(() => undefined),
)
