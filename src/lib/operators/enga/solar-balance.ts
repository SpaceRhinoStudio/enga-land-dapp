import type { BigNumber } from 'ethers'
import { map, type OperatorFunction, pipe } from 'rxjs'
import { parseEther } from '$lib/utils/parse-ether'
import { rnd } from '$lib/shared/utils/random'

/**@description solar is not an ERC20 token so we need a custom logic to pull the balance */
export const solarBalance: OperatorFunction<string, BigNumber> = pipe(
  map(() => parseEther(rnd(100_000))),
)
