<script lang="ts">
  import GodStat from '$lib/GodStat.svelte'

  import { ItemRarityTextColorMap } from '$lib/RarityMaps.svelte'

  import Button from '$lib/shared/Button.svelte'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'
  import { screen$ } from '$lib/shared/helpers/media-queries'
  import { __$ } from '$lib/shared/locales'
  import { GodStats } from '$lib/shared/types/enga'
  import { keysOf } from '$lib/shared/utils/type-safe'
  import type { EndroItemMeta } from '$lib/types/enga'
  import { listToMatrix, rotateMatrix } from '$lib/utils/list-to-matrix'
  import WithCurrencyIcon from '$lib/WithCurrencyIcon.svelte'
  import cn from 'classnames'
  import { identity } from 'rxjs'
  import ShowcaseCardImage from './ShowcaseCardImage.svelte'
  import ShowcaseCardRaw from './ShowcaseCardRaw.svelte'

  let backfaceVisible = false

  export let meta: EndroItemMeta
  export let forSale: boolean

  $: modifierMatrix = meta?.modifiers
    ? listToMatrix(
        keysOf(GodStats).reduce(
          (acc, curr) => (meta.modifiers![curr] ? [...acc, GodStats[curr]] : acc),
          [] as GodStats[],
        ),
        2,
      )
    : undefined
</script>

<!-- // backface={
            //     <div
            //         className="w-full h-full bg-primary-800 rounded-xl flex flex-col p-4 text-text-secondary text-sm"
            //         on:click={() =>
            //             backfaceController$.next({ Display: false })
            //         }></div>
            // } -->
<ShowcaseCardRaw
  isAutoHeight
  keepFrontHeight
  bind:backfaceVisible
  className={{ cardHeight: 'h-full w-full' }}>
  <ShowcaseCardImage slot="left" name={`${$__$?.endro.items.chipset}-${meta.id}`} itemMeta={meta} />
  <span slot="title">{`${$__$?.endro.items.chipset}-${meta.id}`}</span>
  {#if forSale && $screen$.isMobile}
    <span class="text-yellow-400 font-bold absolute top-2 right-2.5">
      <WithCurrencyIcon iconDimensions="1rem" data={meta.marketPrice} />
    </span>
  {/if}
  <span slot="subtitle" class="text-yellow-400 font-bold">
    {#if forSale && !$screen$.isMobile}
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
        {#each ($screen$.isMobile ? identity : rotateMatrix)(modifierMatrix ?? []) as row, rowIndex}
          <div
            class={cn(
              'grid grid-cols-2 md:grid-cols-3 self-center',
              $screen$.isMobile && 'only:mb-6',
            )}>
            {#each row as x, index}
              <GodStat type={x} value={meta.modifiers?.[x]} withSign />
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex space-x-4 justify-end">
        <!-- TODO: interaction UI/UX needed for listing chipset on marketplace -->
        <Button
          job={() => flashToast$.next('This is just a demo!')}
          secondary={!forSale}
          active={forSale}
          className={cn($screen$.isMobile ? '!py-1.5 w-full' : '!py-1')}>
          {forSale ? $__$?.marketplace.purchase : $__$?.dashboard.listInMarketplace}
        </Button>
      </div>
      <!--
                    {/* {$screen$.isMobile && (
                        <div class="flex md:hidden space-x-2 #mt-auto">
                            <span>{$__$?.marketplace.moreDetails}</span>
                            <SVGIcon
                                Icon={ArrowDown}
                                class="-rotate-90"
                                width="0.7rem"
                                height="0.7rem"
                                />
                                </div>
                            )} */}
                            -->
    </div>
  </div>
</ShowcaseCardRaw>
