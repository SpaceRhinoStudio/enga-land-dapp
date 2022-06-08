import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { map, type OperatorFunction, pipe } from 'rxjs'
import type { Nil } from '$lib/types'
import { withValidSignerAddress } from '../web3/with-valid-signer'
import type { SeedSale } from 'engaland_fundraising_app/typechain'

export function seedSaleRequestRelease(vestId: string): OperatorFunction<SeedSale | Nil, boolean> {
  return pipe(
    //TODO: check vesting creator state
    //TODO: check release to be more than zero
    withValidSignerAddress(waitForTransaction(([x]) => x.release(vestId))),
    map(x => !!x),
  )
}
