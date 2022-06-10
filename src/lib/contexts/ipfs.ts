import { config } from '$lib/configs'
import { Window$ } from '$lib/shared/observables/window'
import { map, mergeMap, of, retryWhen, shareReplay, throwError, throwIfEmpty, timer } from 'rxjs'

const ipfsNode$ = Window$.pipe(
  // mergeMap(() => import('ipfs-core')),
  map(() => Ipfs),
  mergeMap(x => x.create()),
  shareReplay(1),
)
ipfsNode$.pipe(throwIfEmpty()).subscribe({
  complete: () => console.log('ipfs node created'),
  error: e => console.error('ipfs node failed', e),
})

export const ipfs$ = ipfsNode$.pipe(
  mergeMap(ipfs => (ipfs.isOnline() ? of(ipfs) : throwError(() => 'ipfs is not ready'))),
  retryWhen(() => timer(config.Retry.Timeout)),
  shareReplay(1),
)

ipfs$.pipe(throwIfEmpty()).subscribe({
  complete: () => console.log('ipfs node online'),
  error: e => console.error('ipfs node failed', e),
})
