import { PopulatedTransaction, providers } from 'ethers'
import {
  type OperatorFunction,
  pipe,
  tap,
  ObservableInput,
  exhaustMap,
  withLatestFrom,
  of,
  switchMap,
  finalize,
  catchError,
  throwError,
  map,
} from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'
import { currentValidSigner$, signerAddress$ } from '$lib/observables/selected-web3-provider'
import _ from 'lodash'
import { mapNil, switchSomeMembers } from '../pass-undefined'
import { fallbackWeb3Provider$ } from '$lib/observables/web3-providers/fallback-provider'
import { combineLatestSwitchMap } from '../combine-latest-switch'
import { inferWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'
import { ActionStatus } from '$lib/types'

//DEBUG: write tests maybe? works fine though
/**
 * @see https://docs.walletconnect.com/mobile-linking
 * @throws if error is not recognized as an standard web3 error it will be thrown untouched
 */
export function executeWrite(options: {
  returnReceipt: true
}): OperatorFunction<PopulatedTransaction, providers.TransactionReceipt | Web3Errors>
export function executeWrite(options?: {
  returnReceipt?: false
}): OperatorFunction<PopulatedTransaction, ActionStatus.SUCCESS | Web3Errors>
export function executeWrite(options?: {
  returnReceipt?: boolean
}): OperatorFunction<
  PopulatedTransaction,
  providers.TransactionReceipt | ActionStatus.SUCCESS | Web3Errors
> {
  return pipe(
    withLatestFrom(fallbackWeb3Provider$),
    switchSomeMembers(withLatestFrom(signerAddress$)),
    switchSomeMembers(
      map(([[tx, provider], address]) => [{ ...tx, from: address }, provider] as const),
      combineLatestSwitchMap(([tx, provider]) => provider.estimateGas(tx)),
      withLatestFrom(currentValidSigner$),
    ),
    switchSomeMembers(
      // all the higher levels should be exhausted instead of switched :shrug:
      exhaustMap(([[tx, provider, gasLimit], signer]) =>
        of(undefined).pipe(
          tap(() => (provider.pollingInterval = 15 * 60 * 1000)),
          switchMap(() => signer.sendUncheckedTransaction({ ...tx, gasLimit })),
          finalize(() => (provider.pollingInterval = 4000)),
          switchMap(hash => provider.getTransaction(hash)),
        ),
      ),
      tap(x => x && pendingTransactionsController$.next({ Add: x })),
      switchMap(x => x.wait()),
      map(x => (options?.returnReceipt ? x : (ActionStatus.SUCCESS as const))),
    ),
    catchError(e => {
      const err = inferWeb3Error(e)
      return err ? of(err) : throwError(() => e)
    }),
    mapNil(x => (_.isUndefined(x) ? Web3Errors.RESOURCE_NOT_FOUND : Web3Errors.INVALID_PARAMS)),
  )
}

export function executeRead<T, R>(
  project: (input: T) => ObservableInput<R>,
): OperatorFunction<T, R | Web3Errors> {
  return pipe(
    switchMap(project),
    catchError(e => {
      const err = inferWeb3Error(e)
      return err ? of(err) : throwError(() => e)
    }),
  )
}
