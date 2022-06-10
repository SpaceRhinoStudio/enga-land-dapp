import { rndEndro } from '$lib/helpers/random/endro'
import { rndEndroItem } from '$lib/helpers/random/items'
import {
  from,
  map,
  mergeAll,
  mergeMap,
  type OperatorFunction,
  pipe,
  reduce,
  toArray,
  withLatestFrom,
} from 'rxjs'
import { EndroItemType, ItemRarity, MainNFTTypes } from '$lib/shared/types/enga'
import { genArr, rnd } from '$lib/utils/random'
import { keysOf } from '$lib/utils/type-safe'
import type { EndroItemMeta, EndroMeta, OpifexMeta } from '$lib/types/enga'

export type OwnedAssetsList = {
  [MainNFTTypes.endro]: EndroMeta[]
  [MainNFTTypes.opifexOff]: OpifexMeta[]
  [MainNFTTypes.opifexIndexed]: OpifexMeta[]
  [MainNFTTypes.tickets]: { [key in ItemRarity]: number }
  [EndroItemType.cosmetics]: EndroItemMeta[]
  [EndroItemType.chipset]: EndroItemMeta[]
  [EndroItemType.consumable]: EndroItemMeta[]
  [EndroItemType.accoutrements]: EndroItemMeta[]
  [EndroItemType.skins]: EndroItemMeta[]
}

export function ownedAssetsList(): OperatorFunction<string, OwnedAssetsList> {
  return pipe(
    mergeMap(() =>
      from(genArr(rnd(4) + 1, rndEndro)).pipe(
        mergeAll(),
        toArray(),
        withLatestFrom(
          from(genArr(rnd(3), () => from(genArr(10, rndEndro)).pipe(mergeAll(), toArray()))).pipe(
            mergeAll(),
            toArray(),
          ),
        ),
      ),
    ),
    map(([endros, indexedEndros]) => ({
      [MainNFTTypes.endro]: endros,
      [MainNFTTypes.opifexOff]: genArr(rnd(3), () => ({
        id: String(rnd(10000)),
        generation: rnd(10),
        isIndexed: false,
      })),
      [MainNFTTypes.opifexIndexed]: indexedEndros.map(x => ({
        id: String(rnd(10000)),
        generation: rnd(10),
        isIndexed: true,
        indexResults: x,
      })),
      [MainNFTTypes.tickets]: keysOf(ItemRarity).reduce(
        (acc, key) => ({ ...acc, [key]: rnd(4) > 1 ? rnd(20) : 0 }),
        {} as { [key in ItemRarity]: number },
      ),
      [EndroItemType.cosmetics]: genArr(rnd(10) + 1, () => rndEndroItem(EndroItemType.cosmetics)),
      [EndroItemType.chipset]: genArr(rnd(10) + 1, () => rndEndroItem(EndroItemType.chipset)),
      [EndroItemType.consumable]: genArr(rnd(10) + 1, () => rndEndroItem(EndroItemType.consumable)),
      [EndroItemType.accoutrements]: genArr(rnd(10) + 1, () =>
        rndEndroItem(EndroItemType.accoutrements),
      ),
      [EndroItemType.skins]: genArr(rnd(10) + 1, () => rndEndroItem(EndroItemType.skins)),
    })),
  )
}
