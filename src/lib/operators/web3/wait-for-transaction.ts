import { ContractReceipt, ContractTransaction, errors as EthersErrors } from 'ethers'
import { type OperatorFunction, pipe, tap, ObservableInput, exhaustMap } from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'

//DEBUG: write tests maybe? works fine though
/**@throws {EthersErrors} */
export function executeTx<T>(
  project: (source: T) => ObservableInput<ContractTransaction>,
): OperatorFunction<T, ContractReceipt> {
  return pipe(
    exhaustMap(x => project(x)),
    tap(x => x && pendingTransactionsController$.next({ Add: x })),
    exhaustMap(x => x.wait()),
  )
}
