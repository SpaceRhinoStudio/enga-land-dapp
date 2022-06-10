import { SENTINEL, type Sentinel } from '$lib/shared/contexts/empty-sentinel'
import _ from 'lodash'
import type { NonUndefinable } from '$lib/types'

export function noSentinelOrUndefined<T>(
  value: T | Sentinel | undefined,
): value is NonUndefinable<T> {
  return !_.isUndefined(value) && value !== SENTINEL
}

export function noSentinel<T>(value: T | Sentinel): value is T {
  return value !== SENTINEL
}

export function noNil<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}
