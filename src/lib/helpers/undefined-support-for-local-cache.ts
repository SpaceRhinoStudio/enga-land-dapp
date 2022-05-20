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
