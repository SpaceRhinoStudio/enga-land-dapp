<script context="module" lang="ts">
  import { ItemRarity } from './types/enga'

  export const ItemRarityTextColorMap: { [key in ItemRarity]: string } = {
    [ItemRarity.common]: 'text-rarity-common',
    [ItemRarity.uncommon]: 'text-rarity-uncommon',
    [ItemRarity.rare]: 'text-rarity-rare',
    [ItemRarity.legendary]: 'text-rarity-legendary',
    [ItemRarity.mythical]: 'text-rarity-mythical',
    [ItemRarity.celestial]: 'text-rarity-celestial',
  }

  export const ItemRarityBorderClassName: { [key in ItemRarity]: string } = {
    common: 'border-rarity-common',
    uncommon: 'border-rarity-uncommon',
    rare: 'border-rarity-rare',
    legendary: 'border-rarity-legendary',
    mythical: 'border-rarity-mythical',
    celestial: 'border-rarity-celestial',
  }

  export const ItemRarityShadowClassName: { [key in ItemRarity]: string } = {
    common: 'shadow-transparent',
    uncommon: 'shadow-rarity-uncommon',
    rare: 'shadow-rarity-rare',
    legendary: 'shadow-rarity-legendary',
    mythical: 'shadow-rarity-mythical',
    celestial: 'shadow-rarity-celestial',
  }

  export const ItemRarityBackgroundClassNames: {
    [key in ItemRarity]: string
  } = {
    [ItemRarity.common]: 'from-rarity-common to-rarity-common via-neutral-600',
    [ItemRarity.uncommon]: 'from-rarity-uncommon to-rarity-uncommon via-sky-800',
    [ItemRarity.rare]: 'from-rarity-rare to-rarity-rare via-violet-900',
    [ItemRarity.legendary]: 'from-rarity-legendary to-rarity-legendary via-purple-700',
    [ItemRarity.mythical]: 'from-rarity-mythical to-rarity-mythical via-orange-500',
    [ItemRarity.celestial]: 'from-rarity-celestial to-rarity-celestial via-orange-600',
  }
</script>
