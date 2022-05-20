import { isSentinel, type Sentinel } from '$lib/contexts/empty-sentinel'
import { BigNumber, ethers } from 'ethers'
import _ from 'lodash'
import { onlyNumbers } from './sanitize-numbers'

export function parseEther(x: string | number | undefined | Sentinel): BigNumber {
  let res = onlyNumbers(String((isSentinel(x) ? undefined : x) ?? 0))
  res = _.isEmpty(res) ? '0' : res
  const decimals = res.split('.')[1]?.slice(0, 17)
  if (decimals) {
    res = [res.split('.')[0]!, decimals].join('.')
  }
  return ethers.utils.parseEther(res)
}
