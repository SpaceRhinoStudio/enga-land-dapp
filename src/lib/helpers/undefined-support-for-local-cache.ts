/**
 * @description this is a serializer/deserializer for undefined values to be used in `LocalCache` service.
 */

import type { AsyncMapper } from '$lib/types'

export const undefinedSupportForLocalCacheSerializer: AsyncMapper = async arg => {
  if (arg === undefined) {
    return 'undefined'
  }
  return arg
}
export const undefinedSupportForLocalCacheDeserializer: AsyncMapper = async arg => {
  if (arg === 'undefined') {
    return undefined
  }
  return arg
}
