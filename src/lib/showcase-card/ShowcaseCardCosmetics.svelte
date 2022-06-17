<script lang="ts">
  import { ItemRarityTextColorMap } from '$lib/RarityMaps.svelte'
  import Button from '$lib/shared/Button.svelte'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'

  import { screen$ } from '$lib/shared/helpers/media-queries'

  import { __$ } from '$lib/shared/locales'
  import type { EndroItemMeta } from '$lib/types/enga'
  import WithCurrencyIcon from '$lib/WithCurrencyIcon.svelte'
  import cn from 'classnames'
  import ShowcaseCardImage from './ShowcaseCardImage.svelte'
  import ShowcaseCardRaw from './ShowcaseCardRaw.svelte'

  let backfaceVisible = false

  export let meta: EndroItemMeta
  export let forSale: boolean
</script>

<ShowcaseCardRaw
  bind:backfaceVisible
  isAutoHeight
  keepFrontHeight
  className={{ cardHeight: 'h-full w-full' }}>
  <ShowcaseCardImage
    slot="left"
    name={`${$__$?.endro.items.cosmetics}-${meta.id}`}
    itemMeta={meta}
    image={meta.image} />
  <span slot="title">{`${$__$?.endro.items.cosmetics}-${meta.id}`}</span>
  <span slot="subtitle" class="text-yellow-400 font-bold">
    {#if forSale}
      <WithCurrencyIcon iconDimensions="1rem" data={meta.marketPrice} />
    {/if}
  </span>
  <div
    class="grow flex flex-col space-y-1 md:space-y-4 text-xs md:text-lg text-text-secondary -mb-0.5 mt-2 md:mt-0 h-full"
    on:click={() => $screen$.isMobile && (backfaceVisible = true)}>
    <div class={cn('text-xs md:text-sm leading-none flex space-x-2')}>
      <span>{$__$?.endro.itemsSpecs.rarity}:</span>
      <span class={cn('font-bold', ItemRarityTextColorMap[meta.rarity])}>
        {$__$?.EngaVerse.rarityLevels[meta.rarity]}
      </span>
    </div>
    <div class="grow flex items-center md:ml-2">
      <div class="w-full grid grid-flow-row items-start gap-0.5 md:gap-2 md:mb-9">
        <div class={cn('flex gap-2')}>
          <span>{$__$?.endro.itemsSpecs.brsModifier}:</span>
          <span class="text-secondary-500">
            +{meta.modifiers?.brs}
          </span>
        </div>
        <div class={cn('flex gap-2')}>
          <span>{$__$?.endro.itemsSpecs.slot}:</span>
          <span>
            {meta.slot && $__$?.endro.cosmeticItems[meta.slot]}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex space-x-4 justify-end">
        <!-- TODO: interaction UI/UX needed for listing chipset on marketplace -->
        <Button
          job={() => flashToast$.next('This is just a demo!')}
          secondary={!forSale}
          active={forSale}
          className={cn($screen$.isMobile ? '#!py-0.5 w-full' : '!py-1')}>
          {forSale ? $__$?.marketplace.purchase : $__$?.dashboard.listInMarketplace}
        </Button>
      </div>
    </div>
  </div>
</ShowcaseCardRaw>
