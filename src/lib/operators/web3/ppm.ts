import { config } from '$lib/configs'
import { switchSome } from '$lib/operators/pass-undefined'
import type { Option } from '$lib/types'
import { BigNumber } from 'ethers'
import { map, OperatorFunction } from 'rxjs'

/**@description utility to parse PPM to human readable number */
export const parsePPM: OperatorFunction<Option<BigNumber>, Option<number>> = switchSome(
  map(x => x.toNumber() / config.PPM),
  map(x => Number(x.toLocaleString())),
)
