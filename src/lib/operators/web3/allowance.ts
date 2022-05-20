import type { ERC20 } from 'engaland_fundraising_app/typechain'
import type { BigNumber, Contract } from 'ethers'
import _ from 'lodash'
import { passNil, passUndefined } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { map, mergeMap, type OperatorFunction } from 'rxjs'
import type { Nil } from '$lib/types'
import { fromEventFilter } from './from-event-filter'
import { withValidSignerAddress } from './signer'

export const allowance: OperatorFunction<
  | readonly [erc20: ERC20 | undefined, owner: string | undefined, spender: string | undefined]
  | undefined,
  BigNumber | undefined
> = passUndefined(
  map(([erc20, owner, spender]) =>
    _.isUndefined(erc20) || _.isUndefined(owner) || _.isUndefined(spender)
      ? undefined
      : ([erc20, owner, spender] as const),
  ),
  passUndefined(
    reEmitUntilChanged(([erc20, owner, spender]) =>
      fromEventFilter(erc20, erc20.filters['Approval(address,address,uint256)'](owner, spender)),
    ),
    mergeMap(([erc20, owner, spender]) => erc20.allowance(owner, spender)),
  ),
)

export const signerAllowance: OperatorFunction<
  readonly [erc20: ERC20 | Nil, spender: Contract | Nil] | Nil,
  BigNumber | Nil
> = passNil(
  withValidSignerAddress(
    map(([[erc20, spender], address]) =>
      _.isUndefined(erc20) || _.isUndefined(spender)
        ? undefined
        : _.isNull(erc20) || _.isNull(spender)
        ? null
        : ([erc20, address, spender.address] as const),
    ),
  ),
  passNil(allowance),
)
