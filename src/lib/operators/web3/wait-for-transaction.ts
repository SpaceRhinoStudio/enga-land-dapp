import { ContractReceipt, ContractTransaction } from 'ethers'
import {
  type OperatorFunction,
  pipe,
  tap,
  ObservableInput,
  exhaustMap,
  withLatestFrom,
  of,
  switchMap,
  take,
  map,
  finalize,
} from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'
import { currentValidSigner$ } from '$lib/observables/selected-web3-provider'
import type { JsonRpcSigner } from '@ethersproject/providers'
import _ from 'lodash'
import { switchSome } from '../pass-undefined'
import { Option } from '$lib/types'
import { fallbackWeb3Provider$ } from '$lib/observables/web3-providers/fallback-provider'

//DEBUG: write tests maybe? works fine though
/**@throws {EthersErrors} */
export function executeTx<T>(
  project: (source: T, signer: JsonRpcSigner) => ObservableInput<ContractTransaction>,
): OperatorFunction<T, Option<ContractReceipt>> {
  return pipe(
    withLatestFrom(currentValidSigner$),
    switchMap(x =>
      fallbackWeb3Provider$.pipe(
        take(1),
        tap(provider => provider && (provider.pollingInterval = 15 * 60 * 1000)),
        map(() => x),
      ),
    ),
    exhaustMap(([x, signer]) => (_.isNil(signer) ? of(null) : project(x, signer))),
    switchMap(x =>
      fallbackWeb3Provider$.pipe(
        take(1),
        tap(provider => provider && (provider.pollingInterval = 4000)),
        map(() => x),
      ),
    ),
    switchSome(
      tap(x => x && pendingTransactionsController$.next({ Add: x })),
      exhaustMap(x => x.wait()),
    ),
    finalize(() =>
      fallbackWeb3Provider$
        .pipe(take(1))
        .subscribe(x => x && x.pollingInterval !== 4000 && (x.pollingInterval = 4000)),
    ),
  )
}
