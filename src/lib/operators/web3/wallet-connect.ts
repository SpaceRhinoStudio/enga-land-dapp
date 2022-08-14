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
import { safeSwitchMap } from '../safe-throw'
import type WalletConnectProvider from '@walletconnect/web3-provider'
import { uselessInteractionController$ } from '$lib/contexts/useless-interaction'
import { controlStreamPayload } from '$lib/shared/operators/control-stream-payload'

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
  const enable = _.get(provider.provider, 'enable')
  if (_.isFunction(enable)) {
    try {
      console.debug('hasEnable', provider.provider)

      return merge(
        from(Promise.resolve(enable.bind(provider.provider)())),
        // fromEventZone(provider.provider),
      ).pipe(
        map(() => ConnectToWalletState.Unknown),
        catchError(e => {
          const emit = _.get(provider.provider, 'emit')
          if (_.isFunction(emit)) {
            emit.bind(provider.provider)('error')
          }

          if (inferWeb3Error(e) === Web3Errors.REJECTED) {
            return of(ConnectToWalletState.Rejected)
          }
          console.warn(e)
          return of(ConnectToWalletState.Error)
        }),
      )
    } catch (e) {
      console.warn(e)
      return of(ConnectToWalletState.Error)
    }
  }
  return of(ConnectToWalletState.Error)
}

const requestAccountsWalletConnect = (
  provider: Omit<providers.Web3Provider, 'provider'> & { provider: WalletConnectProvider },
) => {
  return of(undefined).pipe(
    switchMap(() => provider.provider.enable()),
    map(() => ConnectToWalletState.Success),
    catchError(e =>
      String(e).includes('User close QRCode Modal')
        ? of(ConnectToWalletState.Rejected)
        : of(ConnectToWalletState.Error),
    ),
    tap(
      x =>
        x === ConnectToWalletState.Success &&
        uselessInteractionController$.next({ Display: 'WalletConnect successfully connected' }),
    ),
    switchMap(x =>
      x === ConnectToWalletState.Success
        ? uselessInteractionController$.pipe(
            controlStreamPayload('Display'),
            filter(_.isNil),
            map(() => x),
          )
        : of(x),
    ),
  )
}

const connectToWallet = (meta: Web3ProviderMetadata) => (): Observable<ConnectToWalletState> => {
  return meta.web3Provider$.pipe(
    first(),
    switchMap(provider =>
      meta.id === Web3ProviderId.walletConnect
        ? requestAccountsWalletConnect(provider as any)
        : //? requestAccountsLegacy(provider)
          requestAccountsEIP1102(provider).pipe(
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
          safeSwitchMap(x =>
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
