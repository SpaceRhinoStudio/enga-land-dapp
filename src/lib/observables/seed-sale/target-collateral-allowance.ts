import {
  SeedSaleContract$,
  SeedSaleTargetERC20Collateral$,
} from '../../../contracts/fundraising-contracts'
import { signerAllowance } from '$lib/operators/web3/allowance'
import { combineLatest, shareReplay } from 'rxjs'

export const seedSaleTargetCollateralAllowance$ = combineLatest([
  SeedSaleTargetERC20Collateral$,
  SeedSaleContract$,
]).pipe(signerAllowance, shareReplay(1))
