import { BrowserLocalStorageAPI } from '$lib/services/browser-local-storage-v2'
import { memoryCache } from './memory-cache'

export const browserLocalStorage = new BrowserLocalStorageAPI(memoryCache)
