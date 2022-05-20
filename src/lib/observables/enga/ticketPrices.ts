import type { BigNumber } from 'ethers'
import { Observable, of } from 'rxjs'
import { ItemRarity } from '$lib/types/enga'
import { parseEther } from '$lib/utils/parse-ether'

export const raffleTicketPrices$: Observable<{
  [key in ItemRarity]: BigNumber
}> = of({
  [ItemRarity.common]: parseEther(50),
  [ItemRarity.uncommon]: parseEther(250),
  [ItemRarity.rare]: parseEther(500),
  [ItemRarity.legendary]: parseEther(2500),
  [ItemRarity.mythical]: parseEther(10_000),
  [ItemRarity.celestial]: parseEther(50_000),
})
