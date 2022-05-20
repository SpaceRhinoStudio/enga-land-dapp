import { isNotSentinel, isSentinel, SENTINEL } from '$lib/contexts/empty-sentinel'
import _ from 'lodash'
import { catchError, exhaustMap, filter, from, map, of, type OperatorFunction, pipe } from 'rxjs'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'

export const requestWalletConnect: OperatorFunction<Web3ProviderMetadata, boolean> = pipe(
  exhaustMap(x => x.web3Provider$),
  exhaustMap(provider =>
    from(
      provider.send('eth_requestAccounts', []) as Promise<
        string[] | { result: string[] } | undefined
      >,
    ).pipe(
      catchError(e => {
        if (_.get(e, 'code') == -32002) {
          // already in progress
          return of(SENTINEL)
        }
        if (_.get(e, 'code') == 4001) {
          //UserRejectedRequestError
          return of(false)
        }
        if (_.get(provider.provider, 'enable')) {
          try {
            return from(Promise.resolve(_.get(provider.provider, 'enable')())).pipe(
              map(() => true),
              catchError(() => of(false)),
            )
          } catch {
            return of(false)
          }
        }
        return of(false)
      }),
      map(x => {
        const res = (_.get(x, 'result') ?? x)?.[0]
        return !_.isBoolean(x) && !isSentinel(x) ? (_.isString(res) ? res : false) : x
      }),
    ),
  ),
  filter(isNotSentinel),
  map(x => !!x),
)
