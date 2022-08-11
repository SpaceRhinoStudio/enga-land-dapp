import { solTime } from '$lib/helpers/solidity-time'
import { Web3Errors } from '$lib/helpers/web3-errors'
import { mapNil } from '$lib/operators/pass-undefined'
import { BigNumber, Contract } from 'ethers'
import { first, map, Observable, of, switchMap } from 'rxjs'
import type { Sale } from '../services/sale'

export class Vesting<C extends Contract> {
  constructor(
    public readonly txId: string,
    public readonly price: number,
    public readonly amount: BigNumber,
    public readonly released: BigNumber,
    public readonly started: Date,
    public readonly cliff: Date,
    public readonly end: Date,
    public readonly vestId: string,
    public readonly sale: Sale<C>,
  ) {}

  releasable(): BigNumber {
    const currentTime = solTime()
    if (currentTime < solTime(this.cliff)) {
      return BigNumber.from(0)
    } else if (currentTime >= solTime(this.end)) {
      return this.amount.sub(this.released)
    } else {
      const start = solTime(this.cliff) // start from cliff date
      const duration = solTime(this.end) - solTime(this.cliff) // duration between cliff and end time
      const pastTime = currentTime - start // how much time has passed from cliff until now
      const vestedAmount = this.amount.mul(pastTime).div(duration)
      return vestedAmount.sub(this.released)
    }
  }

  canRevoke(): Observable<boolean> {
    return this.sale.canRevokeVesting$.pipe(mapNil(() => false))
  }
  revoke(): ReturnType<Sale<C>['revokeVesting']> {
    return this.canRevoke().pipe(
      first(),
      switchMap(can =>
        can !== true ? of(Web3Errors.INVALID_PARAMS as const) : this.sale.revokeVesting(this),
      ),
    )
  }

  canRelease(): Observable<boolean> {
    return this.sale.canReleaseVestings$.pipe(
      mapNil(() => false),
      map(x => x && this.releasable().gt(0)),
    )
  }
  release(): ReturnType<Sale<C>['releaseVesting']> {
    return this.canRelease().pipe(
      first(),
      switchMap(can =>
        can !== true ? of(Web3Errors.INVALID_PARAMS as const) : this.sale.releaseVesting(this),
      ),
    )
  }
}
