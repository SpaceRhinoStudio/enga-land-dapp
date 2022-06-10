import { Realms } from '$lib/shared/types/enga'
import { parseEther } from '$lib/utils/parse-ether'
import { rnd, rndAddress, rndElm, rndEnum } from '$lib/utils/random'
import FemaleAfrican from '../../../assets/samples/Female African.png'
import FemaleAsian from '../../../assets/samples/Female Asian.png'
import FemaleWML from '../../../assets/samples/Female WML.png'
import MaleAfrican from '../../../assets/samples/Male African.png'
import MaleAsian from '../../../assets/samples/Male Asian.png'
import MaleWML from '../../../assets/samples/Male WML.png'
import { filter, map, Observable, take } from 'rxjs'
import { __$ } from '$lib/shared/locales'
import { noSentinelOrUndefined } from '$lib/utils/no-sentinel-or-undefined'
import { nanoid } from 'nanoid'
import type { EndroMeta } from '$lib/types/enga'
const dummyImages = [FemaleAfrican, FemaleAsian, FemaleWML, MaleAfrican, MaleAsian, MaleWML]

export function rndEndro(): Observable<EndroMeta> {
  const realm = rndEnum(Realms)
  return __$.pipe(
    filter(noSentinelOrUndefined),
    take(1),
    map(__ => ({
      id: nanoid(),
      title: `${__?.EngaVerse.realms[realm]}-${rnd(10000)}`,
      rarity: rnd(1000),
      level: rnd(25),
      xpLeft: rnd(1048),
      zeal: rnd(1000),
      gen: rnd(100),
      specs: {
        str: rnd(100),
        dex: rnd(100),
        con: rnd(100),
        men: rnd(100),
        com: rnd(100),
        agg: rnd(100),
      },
      powerSource: rnd(10000),
      lastSold: rnd(4) > 1 ? parseEther(rnd(4000)) : undefined,
      marketPrice: parseEther(rnd(2000)),
      image: rndElm(dummyImages),
      meritPoints: rnd(15),
      owner: rndAddress(),
      realm: realm,
    })),
  )
}
