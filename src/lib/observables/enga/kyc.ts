import { switchSomeMembers } from '$lib/operators/pass-undefined'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import { fromEventFilter } from '$lib/operators/web3/from-event-filter'
import type { Option$ } from '$lib/types'
import { combineLatestWith, merge, switchMap } from 'rxjs'
import { KycContract$ } from '../../../contracts/fundraising-contracts'
import { signerAddress$ } from '../selected-web3-provider'

export const isUserKYCVerified$: Option$<boolean> = KycContract$.pipe(
  combineLatestWith(signerAddress$),
  switchSomeMembers(
    reEvaluateSwitchMap(([kyc, address]) =>
      merge(
        fromEventFilter(kyc, kyc.filters.EnableKyc()),
        fromEventFilter(kyc, kyc.filters.DisableKyc()),
        fromEventFilter(kyc, kyc.filters['EnableKyc(address)'](address)),
        fromEventFilter(kyc, kyc.filters['DisableKyc(address)'](address)),
      ),
    ),
    switchMap(([kyc, address]) => kyc.getKycOfUser(address)),
  ),
)
