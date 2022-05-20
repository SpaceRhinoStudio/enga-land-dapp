import { ipfs$ } from '$lib/contexts/ipfs'
import type { CID } from 'ipfs-core'
import { map, mergeMap, Observable } from 'rxjs'

export function ipfsPushText$(
  content: string,
): [cid$: Observable<CID>, controller: AbortController] {
  const controller = new AbortController()

  const res = ipfs$.pipe(
    mergeMap(x => x.add(content, { signal: controller.signal })),
    map(x => x.cid),
  )

  return [res, controller]
}
