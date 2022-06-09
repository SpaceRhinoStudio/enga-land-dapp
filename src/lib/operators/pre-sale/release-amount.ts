import { solTime } from '$lib/helpers/solidity-time'
import { VestingType } from '$lib/observables/pre-sale/signers-vestings'
import { BigNumber } from 'ethers'

export function releaseAmount(vesting: VestingType): BigNumber {
  const currentTime = solTime()
  if (
    currentTime < solTime(vesting.cliff)
    // || vesting.revoked == true
  ) {
    return BigNumber.from(0)
  } else if (currentTime >= solTime(vesting.end)) {
    return vesting.amount.sub(vesting.released)
  } else {
    const start = solTime(vesting.cliff) // start from cliff date
    const duration = solTime(vesting.end) - solTime(vesting.cliff) // duration between cliff and end time
    const pastTime = currentTime - start // how much time has passed from cliff until now
    const vestedAmount = vesting.amount.mul(pastTime).div(duration)
    return vestedAmount.sub(vesting.released)
  }
}
