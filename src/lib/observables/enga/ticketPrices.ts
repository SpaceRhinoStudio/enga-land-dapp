import type { BigNumber } from 'ethers'
import { Observable, of } from 'rxjs'
import { ItemRarity } from '$lib/shared/types/enga'
import { parseEther } from '$lib/utils/parse-ether'

//FIX //TODO implement dynamic fetches
/**@description this is the price of all raffle ticket prices in SOL for buying in platform offers */
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
