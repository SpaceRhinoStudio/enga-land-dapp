import { from, map, mergeAll, Observable, of, toArray } from 'rxjs'
import type { OpifexMeta } from '$lib/types/enga'
import { genArr, rnd, rndAddress } from '$lib/shared/utils/random'
import _ from 'lodash'
import { rndEndro } from './endro'
import { parseEther } from '$lib/utils/parse-ether'

export function rndOpifexOff(): Observable<OpifexMeta> {
  return of({
    id: String(rnd(10000)),
    generation: rnd(16),
    isIndexed: false,
    marketPrice: parseEther(rnd(10000)),
    owner: rndAddress(),
  })
}

export function rndOpifexIndexed(): Observable<OpifexMeta> {
  return from(from(genArr(10, rndEndro)).pipe(mergeAll(), toArray())).pipe(
    map(x => ({
      id: String(rnd(10000)),
      generation: rnd(16),
      isIndexed: true,
      indexResults: x,
      marketPrice: parseEther(rnd(10000)),
      owner: rndAddress(),
    })),
  )
}
