import type { SeedSale } from 'engaland_fundraising_app/typechain'
import { passNil } from '$lib/operators/pass-undefined'
import { waitForTransaction } from '$lib/operators/web3/wait-for-transaction'
import { filter, map, type OperatorFunction, pipe, withLatestFrom, shareReplay, take } from 'rxjs'
import { noNil, noSentinelOrUndefined } from '$lib/utils/no-sentinel-or-undefined'
import { parseEther } from '$lib/utils/parse-ether'
import { withValidSignerAddress } from '../web3/with-valid-signer'
import { SeedSaleStatus } from './status'
import { seedSaleStatus$ } from '$lib/observables/seed-sale/status'
import { seedSaleMinimumRequiredTargetCollateral$ } from '$lib/observables/seed-sale/minimum-required'
import { seedSaleTargetCollateralAllowance$ } from '$lib/observables/seed-sale/target-collateral-allowance'
import { withUpdatesUntilChanged } from '../with-updates-from'

export function seedSaleRequestContribute(
  _amount: string,
): OperatorFunction<SeedSale | undefined | null, boolean> {
  const amount = parseEther(_amount)
  return pipe(
    withValidSignerAddress(
      withLatestFrom(seedSaleStatus$.pipe(filter(noSentinelOrUndefined))),
      map(([[x], status]) => (status === SeedSaleStatus.Funding ? x : undefined)),
    ),
    passNil(
      withUpdatesUntilChanged(
        seedSaleMinimumRequiredTargetCollateral$.pipe(
          filter(noSentinelOrUndefined),
          filter(noNil),
          take(1),
        ),
      ),
      map(([x, min]) => (amount.gte(min) ? x : undefined)),
    ),
    passNil(
      withLatestFrom(
        seedSaleTargetCollateralAllowance$.pipe(filter(noSentinelOrUndefined), filter(noNil)),
      ),
      map(([x, allowance]) => (amount.lte(allowance) ? x : undefined)),
    ),
    passNil(waitForTransaction(x => x.contribute(amount))),
    map(x => !!x),
  )
}
