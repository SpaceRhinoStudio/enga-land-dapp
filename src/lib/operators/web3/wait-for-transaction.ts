import { Contract, PopulatedTransaction, providers } from 'ethers'
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
  merge,
  take,
  ObservedValueOf,
  Observable,
  from,
} from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'
import { currentValidSigner$ } from '$lib/observables/selected-web3-provider'
import _ from 'lodash'
import { fallbackWeb3Provider$ } from '$lib/observables/web3-providers/fallback-provider'
import { withLatestFromFlat } from '../combine-latest-switch'
import {
  catchWeb3ErrorWithPayload,
  inferWeb3Error,
  switchSomeMembersOrWeb3Error,
  throwIfWeb3ErrorWithPayload,
  Web3Errors,
  Web3ErrorWithPayload,
} from '$lib/helpers/web3-errors'
import { ActionStatus } from '$lib/types'
import { waitingForTxAcceptController$ } from '$lib/contexts/waiting-for-tx-accept'
import { controlStreamPayload } from '$lib/shared/operators/control-stream-payload'
import { logOp } from '../log'
import { getContractName } from '../../../contracts'

//DEBUG: write tests maybe? works fine though
/**
 * @see https://docs.walletconnect.com/mobile-linking
 * @throws if error is not recognized as an standard web3 error it will be thrown untouched
 */
export function executeWrite(): OperatorFunction<
  WriteTxResult<PopulatedTransaction>,
  WriteTxResult<providers.TransactionReceipt>
> {
  return pipe(
    throwIfWeb3ErrorWithPayload(),
    withLatestFromFlat(currentValidSigner$),
    switchSomeMembersOrWeb3Error('CurrentValidSigner'),
    withLatestFromFlat(fallbackWeb3Provider$),
    switchSomeMembersOrWeb3Error('Provider'),
    exhaustMap(([, tx, signer, provider]) =>
      of(undefined).pipe(
        tap(() => waitingForTxAcceptController$.next({ Display: true })),
        tap(() => (provider.pollingInterval = 15 * 60 * 1000)),
        switchMap(() =>
          merge(
            signer.sendUncheckedTransaction(tx),
            waitingForTxAcceptController$.pipe(
              controlStreamPayload('Reject'),
              switchMap(() => throwError(() => Web3Errors.REJECTED)),
            ),
          ).pipe(take(1)),
        ),
        finalize(() => waitingForTxAcceptController$.next({ Display: false })),
        finalize(() => (provider.pollingInterval = 4000)),
        switchMap(hash => provider.getTransaction(hash)),
      ),
    ),
    tap(x => x && pendingTransactionsController$.next({ Add: x })),
    switchMap(x => x.wait()),
    map(res => [ActionStatus.SUCCESS, res] as const),
    catchWeb3ErrorWithPayload(),
    logOp.notice('ContractCall.Write', ([status, payload]) => ({
      status,
      payload,
    })),
  )
}

export type WriteTxResult<Payload> =
  | readonly [status: ActionStatus.SUCCESS, payload: Payload]
  | Web3ErrorWithPayload

export function staticCall<T extends Contract, M extends keyof T['populateTransaction']>(
  contract: T,
  method: M,
  ...args: Parameters<T['populateTransaction'][M]>
): Observable<WriteTxResult<PopulatedTransaction>> {
  return currentValidSigner$.pipe(
    take(1),
    switchSomeMembersOrWeb3Error('CurrentValidSigner'),
    switchMap(
      signer =>
        //@ts-ignore it is a valid index, but ts is dumb
        contract.connect(signer).populateTransaction[method]!(
          ...args,
        ) as Promise<PopulatedTransaction>,
    ),
    withLatestFrom(fallbackWeb3Provider$),
    switchSomeMembersOrWeb3Error('Provider'),
    switchMap(([tx, provider]) =>
      provider.estimateGas(tx).then(gasLimit => ({ ...tx, gasLimit } as PopulatedTransaction)),
    ),
    map(res => [ActionStatus.SUCCESS, res] as const),
    catchWeb3ErrorWithPayload(),
    logOp.notice('ContractCall.Static', ([status, payload]) =>
      getContractName(contract).then(cname => ({
        contract: cname,
        address: contract.address,
        method,
        status,
        payload,
      })),
    ),
  )
}

export function readTx<T extends Contract, M extends keyof T['functions']>(
  contract: T,
  method: M,
  ...args: Parameters<T['functions'][M]>
): Observable<
  | readonly [status: ActionStatus.SUCCESS, payload: ObservedValueOf<ReturnType<T['functions'][M]>>]
  | readonly [status: Web3Errors, payload: Error]
> {
  return from(contract[method](...args) as ReturnType<T['functions'][M]>).pipe(
    map(res => [ActionStatus.SUCCESS, res] as const),
    catchError(e => of([inferWeb3Error(e) ?? Web3Errors.INTERNAL_ERROR, e as Error] as const)),
    logOp.notice('ContractCall.Read', ([status, payload]) =>
      getContractName(contract).then(cname => ({
        contract: cname,
        address: contract.address,
        method,
        status,
        payload,
      })),
    ),
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
