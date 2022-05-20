import {
  undefinedSupportForLocalCacheDeserializer,
  undefinedSupportForLocalCacheSerializer,
} from '$lib/helpers/undefined-support-for-local-cache'
import { LocalCache } from '$lib/services/local-cache-v2'
import { browserLocalStorage } from './browser-local-storage'
import { memoryCache } from './memory-cache'

export const localCache = new LocalCache(
  browserLocalStorage,
  [undefinedSupportForLocalCacheSerializer],
  [undefinedSupportForLocalCacheDeserializer],
  memoryCache,
)
