import { SENTINEL, type Sentinel } from '$lib/shared/contexts/empty-sentinel'
import { Option } from '$lib/types'
import _ from 'lodash'

/**
 * @description this function is used to replace a default value with the input value if the input value is falsy.
 */
export function truthy<T, R>(input: Option<T | Error | Sentinel>, defaultValue: R): T | R {
  if (_.isNil(input) || _.isError(input) || input === SENTINEL) {
    return defaultValue
  }
  return input
}
