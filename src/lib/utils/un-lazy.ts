import _ from 'lodash'
import type { LazyEval } from '$lib/types'

export function unLazy<T, Args extends unknown[] = unknown[]>(
  input: LazyEval<T, Args>,
  ...args: Args
): T {
  return _.isFunction(input) ? input(...args) : input
}
