import { isSentinel, type Sentinel } from '$lib/contexts/empty-sentinel'
import _ from 'lodash'
import type { Nil } from '$lib/types'

export function keysOf<K extends string | number = number>(
  source: { [x in K]?: unknown } | unknown[] | Nil | Sentinel,
): K[] {
  if (isSentinel(source) || _.isNil(source)) {
    return []
  }
  return _.keys(source) as K[]
}
