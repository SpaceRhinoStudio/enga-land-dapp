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

export enum GodStats {
  'str' = 'str',
  'dex' = 'dex',
  'con' = 'con',
  'men' = 'men',
  'com' = 'com',
  'agg' = 'agg',
}

export enum ItemRarity {
  'common' = 'common',
  'uncommon' = 'uncommon',
  'rare' = 'rare',
  'legendary' = 'legendary',
  'mythical' = 'mythical',
  'celestial' = 'celestial',
}

export enum EndroItemType {
  'cosmetics' = 'cosmetics',
  'chipset' = 'chipset',
  'consumable' = 'consumable',
  'accoutrements' = 'accoutrements',
  'skins' = 'skins',
}

export enum CosmeticSlots {
  'head' = 'head',
  'eye' = 'eye',
  'body' = 'body',
  'mask' = 'mask',
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

export enum Realms {
  'ufm' = 'ufm',
  'magesta' = 'magesta',
  'nubia' = 'nubia',
  'sigr' = 'sigr',
  'komorebi' = 'komorebi',
}

export enum MainNFTTypes {
  'endro' = 'endro',
  'opifexOff' = 'opifexOff',
  'opifexIndexed' = 'opifexIndexed',
  'tickets' = 'tickets',
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
export enum EndroSortOptions {
  'lowerGeneration' = 'lowerGeneration',
  'higherGeneration' = 'higherGeneration',
}

export enum MarketplaceSortOptions {
  'latest' = 'latest',
  'cheap' = 'cheap',
  'expensive' = 'expensive',
}
