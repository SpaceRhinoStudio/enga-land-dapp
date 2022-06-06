import { isSentinel, type Sentinel } from '$lib/contexts/empty-sentinel'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import _ from 'lodash'
import { map, type OperatorFunction } from 'rxjs'
import type { FormatterOperator } from '$lib/types'
import { onlyNumbers } from '$lib/utils/sanitize-numbers'

export const CurrencyFormatterOperatorFactory: FormatterOperator<[number?]> = () =>
  // precision?: number,
  {
    return input =>
      input.pipe(
        map(input => {
          const res = onlyNumbers(input).split('.')
          return (
            (res[0]
              ?.replace(/^0+$/, '0')
              .replace(/^0*(?=[^0])/, '')
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '') +
            (!_.isUndefined(res[1]) ? `.${res[1]}` : '')
          )
        }),
      )
  }

export const CurrencyParsersOperator: OperatorFunction<string, string> = input =>
  input.pipe(map(onlyNumbers))

const units: { floor: number; unit: string }[] = [
  {
    floor: 1_000_000_000,
    unit: 'B',
  },
  {
    floor: 1_000_000,
    unit: 'M',
  },
  {
    floor: 1_000,
    unit: 'K',
  },
]

export function formatCurrencyWithUnit(
  x: string | number | BigNumber | undefined | null | Sentinel,
  precision = 2,
): string & { raw: string; unit: string } {
  let res = isSentinel(x) || _.isNil(x) ? 0 : x
  if (BigNumber.isBigNumber(res)) {
    res = formatEther(res)
  }
  res = String(res)
  if (res.length === 0) {
    res = '0'
  }
  res = Number(res)
  if (_.isNaN(res)) {
    res = 0
  }
  const matchingUnit = units.find(unit => res >= unit.floor)
  if (matchingUnit) {
    res = res / matchingUnit.floor
  }
  res = res.toLocaleString(undefined, { maximumFractionDigits: precision })
  const finalRes = new String(`${res}${matchingUnit?.unit ?? ''}`)
  ;(finalRes as string & { unit: string }).unit = matchingUnit?.unit ?? ''
  ;(finalRes as string & { raw: string }).raw = res
  return finalRes as string & { raw: string; unit: string }
}
