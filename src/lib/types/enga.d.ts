import {
  CosmeticSlots,
  EndroItemType,
  GodStats,
  ItemRarity,
  Realms,
} from '$lib/shared/shared/types/enga'
import type { BigNumber } from 'ethers'

export type EndroMeta = {
  id: string
  title: string
  rarity: number
  level: number
  xpLeft: number
  zeal: number
  gen: number
  specs: {
    [key in GodStats]: number
  }
  powerSource: number
  lastSold?: BigNumber | undefined
  meritPoints: number
  owner: string
  realm: Realms
  marketPrice?: BigNumber
  image: string | undefined
}

export type EndroItemMeta = {
  id: string
  name: string
  rarity: ItemRarity
  image?: string
  type: EndroItemType
  slot?: CosmeticSlots
  mintDate?: Date
  modifiers?: {
    [key in 'brs' | GodStats]?: number
  }
  // consumableModifiers?: unknown
}

export type OpifexMeta = {
  id: string
  generation: number
  isIndexed: boolean
  indexResults?: EndroMeta[]
}

export type RaffleTicketMeta = {
  rarity: ItemRarity
}
