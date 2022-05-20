import type { ContractTransaction } from 'ethers'
import _ from 'lodash'
import { asyncScheduler, observeOn, scan, Subject, tap } from 'rxjs'

type TxHash = string

export const pendingTransactionsController$ = new Subject<
  Partial<{
    Add: ContractTransaction
    Fulfill: TxHash
    Fail: TxHash
  }>
>()

export const pendingTransactions$ = pendingTransactionsController$.pipe(
  observeOn(asyncScheduler),
  tap(x =>
    x.Add?.wait()
      .then(() =>
        pendingTransactionsController$.next({
          Fulfill: x.Add!.hash,
        }),
      )
      .catch(() => pendingTransactionsController$.next({ Fail: x.Add!.hash })),
  ),
  scan(
    (acc, x) =>
      x.Add
        ? { ...acc, [x.Add.hash]: x.Add }
        : x.Fail ?? x.Fulfill
        ? _.omit(acc, x.Fulfill ?? x.Fail ?? '')
        : acc,
    {} as { [hash: TxHash]: ContractTransaction },
  ),
)
