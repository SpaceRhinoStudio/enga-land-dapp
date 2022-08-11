import { isSentinel, type Sentinel } from '$lib/shared/contexts/empty-sentinel'
import { Option } from '$lib/types'
import { BigNumber, ethers } from 'ethers'
import _ from 'lodash'
import { isObservable, map, Observable } from 'rxjs'
import { onlyNumbers } from './sanitize-numbers'

export type EtherParsable = Option<string | number | Sentinel | BigNumber>

export function parseEther(x: EtherParsable): BigNumber
export function parseEther(x: Observable<EtherParsable>): Observable<BigNumber>
export function parseEther(
  x: EtherParsable | Observable<EtherParsable>,
): BigNumber | Observable<BigNumber> {
  if (BigNumber.isBigNumber(x)) {
    return x
  }
  if (isObservable(x)) {
    return x.pipe(map(x => parseEther(x)))
  }

  let res = onlyNumbers(String((isSentinel(x) ? undefined : x) ?? 0))
  res = _.isEmpty(res) ? '0' : res
  const decimals = res.split('.')[1]?.slice(0, 18)
  if (decimals) {
    res = [res.split('.')[0]!, decimals].join('.')
  }
  return ethers.utils.parseEther(res)
}
