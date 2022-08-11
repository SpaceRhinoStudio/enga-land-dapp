import { Option } from '$lib/types'
import _ from 'lodash'

export function noZero(x: Option<number | string>, replacement: number): number {
  return Number(x) === 0 || _.isNaN(Number(x)) ? replacement : Number(x)
}

export function zeroIfNegative(n: number | undefined): number {
  return (n ?? 0) < 0 ? 0 : n ?? 0
}
