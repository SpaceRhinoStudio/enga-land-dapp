import type { ContractReceipt, ContractTransaction } from 'ethers'
import { passUndefined } from '$lib/operators/pass-undefined'
import { mergeMap, type OperatorFunction, pipe, tap } from 'rxjs'
import { pendingTransactionsController$ } from './pending-transactions'

export function waitForTransaction<T>(
  project: (source: T) => Promise<ContractTransaction>,
): OperatorFunction<T | undefined, ContractReceipt | undefined> {
  return pipe(
    passUndefined(
      mergeMap(x => project(x).catch(() => undefined)),
      tap(x => x && pendingTransactionsController$.next({ Add: x })),
    ),
    passUndefined(mergeMap(x => x.wait().catch(() => undefined))),
  )
}
