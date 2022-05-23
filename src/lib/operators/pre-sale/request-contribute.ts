import type { Controller } from 'engaland_fundraising_app/typechain'
import { preSaleMinimumRequiredTargetCollateral$ } from '$lib/observables/pre-sale/minimum-required'
import { preSaleStatus$ } from '$lib/observables/pre-sale/status'
import { preSaleTargetCollateralAllowance$ } from '$lib/observables/pre-sale/target-collateral-allowance'
import { PreSaleStatus } from '$lib/operators/pre-sale/status'
import { passNil } from '$lib/operators/pass-undefined'
import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { filter, map, type OperatorFunction, pipe, withLatestFrom } from 'rxjs'
import { noNil, noSentinelOrUndefined } from '$lib/utils/no-sentinel-or-undefined'
import { parseEther } from '$lib/utils/parse-ether'
import { PreSaleContract$ } from '../../../contracts/fundraising-contracts'
import { withValidSignerAddress } from '../web3/with-valid-signer'

export function requestContribute(
  _amount: string,
): OperatorFunction<Controller | undefined | null, boolean> {
  const amount = parseEther(_amount)
  return pipe(
    withValidSignerAddress(
      withLatestFrom(preSaleStatus$.pipe(filter(noSentinelOrUndefined))),
      map(([[x], status]) => (status === PreSaleStatus.Funding ? x : undefined)),
    ),
    passNil(
      withLatestFrom(
        preSaleMinimumRequiredTargetCollateral$.pipe(filter(noSentinelOrUndefined), filter(noNil)),
      ),
      map(([x, min]) => (amount.gte(min) ? x : undefined)),
    ),
    passNil(
      withLatestFrom(
        preSaleTargetCollateralAllowance$.pipe(filter(noSentinelOrUndefined), filter(noNil)),
      ),
      map(([x, allowance]) => (amount.lte(allowance) ? x : undefined)),
    ),
    passNil(
      withLatestFrom(PreSaleContract$.pipe(filter(noSentinelOrUndefined), filter(noNil))),
      waitForTransaction(([x, presale]) => x.contribute(presale.address, amount)),
    ),
    map(x => !!x),
  )
}
