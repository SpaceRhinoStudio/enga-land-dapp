import { ContractReceipt, ContractTransaction } from 'ethers'
import {
  type OperatorFunction,
  pipe,
  tap,
  ObservableInput,
  exhaustMap,
  withLatestFrom,
  of,
} from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'
import { currentValidSigner$ } from '$lib/observables/selected-web3-provider'
import type { JsonRpcSigner } from '@ethersproject/providers'
import _ from 'lodash'
import { switchSome } from '../pass-undefined'
import { Option } from '$lib/types'

//DEBUG: write tests maybe? works fine though
/**@throws {EthersErrors} */
export function executeTx<T>(
  project: (source: T, signer: JsonRpcSigner) => ObservableInput<ContractTransaction>,
): OperatorFunction<T, Option<ContractReceipt>> {
  return pipe(
    withLatestFrom(currentValidSigner$),
    exhaustMap(([x, signer]) => (_.isNil(signer) ? of(null) : project(x, signer))),
    switchSome(
      tap(x => x && pendingTransactionsController$.next({ Add: x })),
      exhaustMap(x => x.wait()),
    ),
  )
}
