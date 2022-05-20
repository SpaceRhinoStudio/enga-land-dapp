import type { ERC20 } from 'engaland_fundraising_app/typechain'
import _ from 'lodash'
import { passNil } from '$lib/operators/pass-undefined'
import { map, type OperatorFunction, pipe } from 'rxjs'
import type { Contract } from 'ethers'
import { waitForTransaction } from './wait-for-transaction'
import { withValidSignerAddress } from './signer'
import { pipeIfNot } from '$lib/operators/pipe-if-not'
import { signerAllowance } from './allowance'
import { parseEther } from '$lib/utils/parse-ether'
import type { Nil } from '$lib/types'

export function signerApprove(
  _amount: string,
): OperatorFunction<[erc20: ERC20 | Nil, spender: Contract | Nil] | undefined, boolean> {
  const amount = parseEther(_amount)
  return pipe(
    passNil(
      map(([erc20, spender]) =>
        _.isUndefined(erc20) || _.isUndefined(spender)
          ? undefined
          : _.isNull(erc20) || _.isNull(spender)
          ? null
          : ([erc20, spender] as const),
      ),
    ),
    pipeIfNot(
      pipe(
        signerAllowance,
        map(x => x?.gte(amount)),
        map(x => !!x),
      ),
      withValidSignerAddress(
        waitForTransaction(([[erc20, spender]]) => erc20!.approve(spender!.address, amount)),
      ),
    ),
    map(x => !!x),
  )
}
