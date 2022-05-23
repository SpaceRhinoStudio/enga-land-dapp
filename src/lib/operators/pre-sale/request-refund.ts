import type { Controller } from 'engaland_fundraising_app/typechain'
import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { map, type OperatorFunction, pipe } from 'rxjs'
import type { Nil } from '$lib/types'
import { withValidSignerAddress } from '../web3/with-valid-signer'

export function requestRefund(
  saleAddress: string,
  vestId: string,
): OperatorFunction<Controller | Nil, boolean> {
  return pipe(
    withValidSignerAddress(
      waitForTransaction(([x, address]) => x.refund(saleAddress, address, vestId)),
    ),
    map(x => !!x),
  )
}
