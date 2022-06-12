import type { BigNumber } from 'ethers'
import { map, type OperatorFunction, pipe } from 'rxjs'
import { parseEther } from '$lib/utils/parse-ether'
import { rnd } from '$lib/shared/utils/random'

export const solarBalance: OperatorFunction<string, BigNumber> = pipe(
  map(() => parseEther(rnd(100_000))),
)
