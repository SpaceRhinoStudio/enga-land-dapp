import type { Controller } from 'engaland_fundraising_app/typechain'
import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { map, type OperatorFunction, pipe } from 'rxjs'
import type { Nil } from '$lib/types'
import { withValidSignerAddress } from '../web3/with-valid-signer'

export function preSaleRequestRefund(vestId: string): OperatorFunction<Controller | Nil, boolean> {
  return pipe(
    withValidSignerAddress(waitForTransaction(([x, address]) => x.refund(address, vestId))),
    map(x => !!x),
  )
}
