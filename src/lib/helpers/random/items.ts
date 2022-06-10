import { CosmeticSlots, EndroItemType, GodStats, ItemRarity } from '$lib/shared/types/enga'
import type { EndroItemMeta } from '$lib/types/enga'
import { genArr, rnd, rndElm, rndEnum, rndPick } from '$lib/utils/random'
import { keysOf } from '$lib/utils/type-safe'
import FemaleEngoCommonTanktop from '../../../assets/samples/items/FemaleEngoCommonTanktop.png'
import FemaleEngoLegendaryTanktop from '../../../assets/samples/items/FemaleEngoLegendaryTanktop.png'
import FemaleEngoRareTanktop from '../../../assets/samples/items/FemaleEngoRareTanktop.png'
import FemaleHCType2MaizeCrayola from '../../../assets/samples/items/FemaleHCType2MaizeCrayola.png'
import FemaleHCType3CadetFront from '../../../assets/samples/items/FemaleHCType3Cadet-Front.png'
import FemaleHCType3TimberWolfFront from '../../../assets/samples/items/FemaleHCType3TimberWolf-Front.png'
import FemaleHCType4ByzantiumFront from '../../../assets/samples/items/FemaleHCType4Byzantium-Front.png'

const dummyItemImages = [
  FemaleEngoCommonTanktop,
  FemaleEngoLegendaryTanktop,
  FemaleEngoRareTanktop,
  FemaleHCType2MaizeCrayola,
  FemaleHCType3CadetFront,
  FemaleHCType3TimberWolfFront,
  FemaleHCType4ByzantiumFront,
]

const dummyItemNames = [
  'Cummerbund',
  'Shirt',
  'Fleece',
  'Suit',
  'Nightgown',
  'Overalls',
  'Sunglasses',
  'Tights',
  'Poncho',
  'Cufflinks',
  'Robe',
  'Belt',
  'Cardigan',
  'Cargos',
  'Shoes',
  'Briefs',
  'Corset',
  'Cravat',
  'Boots',
  'Pajamas',
  'Sweatshirt',
  'Jacket',
  'Skirt',
  'Hat',
  'Sandals',
  'Slippers',
  'Camisole',
  'Polo Shirt',
  'Bikini',
  'Lingerie',
  'Swimwear',
  'Bow Tie',
  'Shawl',
  'Shorts',
  'Swimming Shorts',
  'Dinner Jacket',
  'Top',
  'Scarf',
  'Kilt',
  'Tie',
  'Underwear',
  'Hoody',
  'Thong',
  'Waistcoat',
  'Sarong',
  'Tankini',
  'Tracksuit',
  'Blazer',
  'Socks',
  'Boxers',
  'Dress',
  'Gloves',
  'Jeans',
  'Knickers',
  'Stockings',
  'Blouse',
  'Gown',
  'Bra',
  'Jogging Suit',
  'Coat',
  'T-Shirt',
]

export function rndEndroItem(
  type?: EndroItemType,
  modifiers?: EndroItemMeta['modifiers'],
  slot?: CosmeticSlots,
): EndroItemMeta {
  if (!type) {
    type = rndEnum(EndroItemType)
  }
  if (!modifiers) {
    if (type === EndroItemType.cosmetics) {
      modifiers = { brs: rnd(10) + 1 }
    }
    if (type === EndroItemType.chipset) {
      const statsToModify = rndPick(keysOf(GodStats), rnd(6) + 1)
      modifiers = statsToModify.reduce(
        (acc, key) => ({
          ...acc,
          [GodStats[key]]: rnd(21) - 10 || 1,
        }),
        {} as { [x in GodStats]: number },
      )
    }
  }
  if (!slot) {
    if (type === EndroItemType.cosmetics) {
      slot = rndEnum(CosmeticSlots)
    }
  }
  return {
    id: `${rnd(1000)}`,
    name: rndElm(dummyItemNames),
    rarity: rndEnum(ItemRarity),
    ...(type === EndroItemType.chipset ? {} : { image: rndElm(dummyItemImages) }),
    type: type!,
    ...(slot ? { slot } : {}),
    mintDate: new Date(`2022/${rnd(12) + 1}/${rnd(28) + 1}`),
    ...(modifiers ? { modifiers } : {}),
  }
}

export function rndEndroItemSet(): {
  available: EndroItemMeta[]
  equipped: EndroItemMeta[]
} {
  const x = genArr(20, () => rndEndroItem())
  const equipped = [
    ...rndPick(
      x
        .filter(x => x.type === EndroItemType.cosmetics)
        .reduce(
          (acc, curr) => (acc.findIndex(x => x.slot === curr.slot) === -1 ? [...acc, curr] : acc),
          [] as EndroItemMeta[],
        ),
      rnd(5),
    ),
    ...rndPick(
      x.filter(x => x.type === EndroItemType.chipset),
      rnd(5),
    ),
  ]
  return {
    available: x.filter(x => equipped.findIndex(i => x.id === i.id) === -1),
    equipped,
  }
}
