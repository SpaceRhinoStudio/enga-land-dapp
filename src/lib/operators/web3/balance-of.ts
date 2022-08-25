import type { EngaToken, ERC20 } from 'engaland_fundraising_app/typechain'
import type { BigNumber } from 'ethers'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import { merge, switchMap, of, switchAll, combineLatestWith } from 'rxjs'
import type { Option$ } from '$lib/types'
import { fromEventFilter } from './from-event-filter'
import { switchSome, switchSomeMembers } from '../pass-undefined'
import { memoryCache } from '$lib/contexts/memory-cache'
import { signerAddress$ } from '$lib/observables/selected-web3-provider'

const userBalanceChangeTriggers$$ = ([erc20, address]: [ERC20 | EngaToken, string]) =>
  merge(
    fromEventFilter(erc20, erc20.filters['Transfer(address,address,uint256)'](undefined, address)),
    fromEventFilter(erc20, erc20.filters['Transfer(address,address,uint256)'](address)),
  )

export const userBalanceOf$$ = (contract$: Option$<ERC20 | EngaToken>): Option$<BigNumber> => {
  return contract$.pipe(
    switchSome(
      switchMap(erc20 => {
        return memoryCache.observe(
          `userBalanceOf$$_${erc20.address}`,
          of(erc20).pipe(
            combineLatestWith(signerAddress$),
            switchSomeMembers(
              reEvaluateSwitchMap(userBalanceChangeTriggers$$),
              switchMap(([erc20, address]) => erc20.balanceOf(address)),
            ),
          ),
        )
      }),
      switchAll(),
    ),
  )
}
