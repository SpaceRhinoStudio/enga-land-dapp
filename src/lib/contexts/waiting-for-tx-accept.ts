import { BehaviorSubject } from 'rxjs'

export const waitingForTxAcceptController$ = new BehaviorSubject<{
  Display?: boolean
  Reject?: true
}>({
  Display: false,
})
