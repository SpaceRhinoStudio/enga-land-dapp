import {
  PreSaleContract$,
  PreSaleTargetERC20Collateral$,
} from '../../../contracts/fundraising-contracts'
import { signerAllowance } from '$lib/operators/web3/allowance'
import { combineLatest, shareReplay } from 'rxjs'

export const preSaleTargetCollateralAllowance$ = combineLatest([
  PreSaleTargetERC20Collateral$,
  PreSaleContract$,
]).pipe(signerAllowance, shareReplay(1))
