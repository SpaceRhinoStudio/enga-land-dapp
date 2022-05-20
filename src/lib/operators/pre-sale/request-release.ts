import type { Controller } from 'engaland_fundraising_app/typechain'
import { withValidSignerAddress } from '$lib/operators/web3/signer'
import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { map, type OperatorFunction, pipe } from 'rxjs'
import type { Nil } from '$lib/types'

export function requestRelease(vestId: string): OperatorFunction<Controller | Nil, boolean> {
  return pipe(
    //TODO: check vesting creator state
    //TODO: check release to be more than zero
    withValidSignerAddress(waitForTransaction(([x]) => x.release(vestId))),
    map(x => !!x),
  )
}
