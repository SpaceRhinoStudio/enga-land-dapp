import type { ERC20 } from 'engaland_fundraising_app/typechain'
import { BigNumber, Contract, Signer, utils } from 'ethers'
import { switchSomeMembers } from '$lib/operators/pass-undefined'
import {
  combineLatest,
  debounceTime,
  from,
  map,
  merge,
  shareReplay,
  switchAll,
  switchMap,
} from 'rxjs'
import type { Option$ } from '$lib/types'
import { fromEventFilter } from './from-event-filter'
import { signerAddress$ } from '$lib/observables/selected-web3-provider'
import { memoryCache } from '$lib/contexts/memory-cache'
import { resolveAddress } from './resolve-address'

export const allowance$$ =
  (
    contract$: Option$<ERC20>,
  ): ((
    spender$: Option$<string | Contract>,
  ) => (address$: Option$<string | Signer>) => Option$<BigNumber>) =>
  spender$ => {
    const spenderAddress$ = resolveAddress(spender$).pipe(shareReplay(1))
    return address$ =>
      combineLatest([contract$, spenderAddress$, resolveAddress(address$)]).pipe(
        switchSomeMembers(
          switchMap(([contract, spender, address]) =>
            memoryCache.observe(
              `allowance$$_${contract.address}_${spender}_${address}`,
              merge(
                from(contract.allowance(address, spender)),
                fromEventFilter(
                  contract,
                  contract.filters['Approval(address,address,uint256)'](address, spender),
                ).pipe(
                  debounceTime(500),
                  map(([, , value]) => value),
                ),
              ),
            ),
          ),
          switchAll(),
        ),
      )
  }

export const userAllowance$$ = (
  contract$: Option$<ERC20>,
): ((spender$: Option$<string | Contract>) => Option$<BigNumber>) => {
  const targetAllowance$$ = allowance$$(contract$)
  return spender$ => targetAllowance$$(spender$)(signerAddress$).pipe(shareReplay(1))
}
