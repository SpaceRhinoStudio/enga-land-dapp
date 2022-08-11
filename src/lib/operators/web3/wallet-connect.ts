import _ from 'lodash'
import {
  map,
  MonoTypeOperatorFunction,
  Observable,
  of,
  shareReplay,
  from,
  switchMap,
  filter,
  timeout,
  catchError,
  concat,
  merge,
  concatMap,
  first,
} from 'rxjs'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { Option, Web3ProviderId } from '$lib/types'
import { switchSome } from '../pass-undefined'
import { mapToValidSigner } from './signer'
import type { JsonRpcSigner } from '@ethersproject/providers'
import type EventEmitter from 'events'
import { inferWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'
import { providers } from 'ethers'
import { fromEventZone } from '../zone'

const isWalletConnected$$ = (meta: Web3ProviderMetadata) =>
  of(meta).pipe(
    switchSome(mapToValidSigner),
    map<Option<JsonRpcSigner>, boolean>(x => !!x),
  )

enum ConnectToWalletState {
  Error,
  Success,
  Unknown,
  Rejected,
}

const requestAccountsEIP1102 = (provider: providers.Web3Provider) =>
  from(
    Promise.resolve(provider.send('eth_requestAccounts', [])) as Promise<
      string[] | { result: string[] } | undefined
    >,
  ).pipe(
    map(rawResult => {
      const result = (_.get(rawResult, 'result') ?? rawResult)?.[0]
      if (_.isString(result)) {
        return ConnectToWalletState.Success
      }
      return ConnectToWalletState.Unknown
    }),
    catchError(e => {
      if (inferWeb3Error(e) === Web3Errors.REJECTED) {
        return of(ConnectToWalletState.Rejected)
      }
      return of(ConnectToWalletState.Error)
    }),
  )

const requestAccountsLegacy = (provider: providers.Web3Provider) => {
  if (_.get(provider.provider, 'enable')) {
    try {
      from(Promise.resolve(_.get(provider.provider, 'enable')())).pipe(
        map(() => ConnectToWalletState.Unknown),
        catchError(e => {
          if (inferWeb3Error(e) === Web3Errors.REJECTED) {
            return of(ConnectToWalletState.Rejected)
          }
          console.warn(e)
          return of(ConnectToWalletState.Unknown)
        }),
      )
    } catch (e) {
      console.warn(e)
      return of(ConnectToWalletState.Error)
    }
  }
  return of(ConnectToWalletState.Error)
}

const connectToWallet = (meta: Web3ProviderMetadata) => (): Observable<ConnectToWalletState> => {
  return meta.web3Provider$.pipe(
    first(),
    switchMap(provider =>
      meta.id === Web3ProviderId.walletConnect
        ? requestAccountsLegacy(provider)
        : requestAccountsEIP1102(provider).pipe(
            switchMap(x =>
              x === ConnectToWalletState.Error ? requestAccountsLegacy(provider) : of(x),
            ),
          ),
    ),
  )
}

export const evaluateProvider: MonoTypeOperatorFunction<Option<Web3ProviderMetadata>> = switchSome(
  switchMap(meta => {
    const isConnected$ = isWalletConnected$$(meta).pipe(shareReplay(1))
    const connect = connectToWallet(meta)
    const handleConnectRequest = () =>
      from(connect()).pipe(
        switchMap(status =>
          status === ConnectToWalletState.Error || status === ConnectToWalletState.Rejected
            ? of(null)
            : isConnected$.pipe(
                filter(x => x),
                first(),
                map(() => meta),
                timeout({ first: 2000 }),
                catchError(() => of(null)),
              ),
        ),
      )

    return isConnected$.pipe(
      concatMap((isConnected, i) =>
        isConnected ? of(meta) : i === 0 ? handleConnectRequest() : of(null),
      ),
    )
  }),
  switchSome(
    switchMap(x =>
      concat(
        of(x),
        of(x).pipe(
          switchMap(x => x.provider$),
          switchMap(x =>
            merge(
              fromEventZone(x as EventEmitter, 'close'),
              fromEventZone(x as EventEmitter, 'disconnect'),
            ),
          ),
          map(() => null),
        ),
      ),
    ),
  ),
)
