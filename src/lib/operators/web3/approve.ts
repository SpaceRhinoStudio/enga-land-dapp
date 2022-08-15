import type { ERC20 } from 'engaland_fundraising_app/typechain'
import { mapNil, switchSomeMembers } from '$lib/operators/pass-undefined'
import { map, combineLatest, switchMap, of, shareReplay, first, exhaustMap } from 'rxjs'
import { BigNumber, Contract } from 'ethers'
import { executeWrite } from './wait-for-transaction'
import { userAllowance$$ } from './allowance'
import { ActionStatus, ConditionedAction, Option$ } from '$lib/types'
import { resolveAddress } from './resolve-address'
import { signerAddress$ } from '$lib/observables/selected-web3-provider'
import { mapNilToWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'

export const userApprove = (
  contract$: Option$<ERC20>,
): ((
  spender$: Option$<string | Contract>,
) => (amount$: Option$<BigNumber>) => ConditionedAction) => {
  const targetAllowance$$ = userAllowance$$(contract$)
  return spender$ => {
    const spenderAddress$ = resolveAddress(spender$).pipe(shareReplay(1))
    const allowance$ = targetAllowance$$(spenderAddress$).pipe(shareReplay(1))
    return amount$ => {
      const _amount$ = amount$.pipe(map(x => (x?.lte(0) ? null : x)))
      const can$ = combineLatest([contract$, _amount$, allowance$, signerAddress$]).pipe(
        switchSomeMembers(
          map(([, amount, allowance]) => (allowance.gte(amount) ? ActionStatus.USELESS : true)),
        ),
        mapNil(x =>
          x === null
            ? (Web3Errors.INVALID_PARAMS as const)
            : (Web3Errors.RESOURCE_NOT_FOUND as const),
        ),
        shareReplay(1),
      )
      const call = () => {
        return can$.pipe(
          first(),

          switchMap(can =>
            can !== true
              ? of(can)
              : combineLatest([contract$, spenderAddress$, _amount$, signerAddress$]).pipe(
                  first(),
                  switchSomeMembers(
                    exhaustMap(([erc20, spender, amount]) =>
                      erc20.populateTransaction.approve(spender, amount),
                    ),
                    executeWrite(),
                    //TODO: double check with event logs
                    //TODO: add utility to do event log check automatically with proper types
                  ),
                  mapNilToWeb3Error(),
                ),
          ),
        )
      }
      return { can$, call }
    }
  }
}
