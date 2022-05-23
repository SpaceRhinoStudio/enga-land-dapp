import type { EngaToken, ERC20 } from 'engaland_fundraising_app/typechain'
import type { BigNumber } from 'ethers'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { merge, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { Nil } from '$lib/types'
import { fromEventFilter } from './from-event-filter'
import { withValidSignerAddress } from './signer'

export const signerBalanceOf: OperatorFunction<ERC20 | EngaToken | Nil, BigNumber | Nil> = pipe(
  withValidSignerAddress(
    reEmitUntilChanged(([x, address]) =>
      merge(
        fromEventFilter(x, x.filters['Transfer(address,address,uint256)'](undefined, address)),
        fromEventFilter(x, x.filters['Transfer(address,address,uint256)'](address)),
      ),
    ),
    switchMap(([x, address]) => x.balanceOf(address)),
  ),
)
