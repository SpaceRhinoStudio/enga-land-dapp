<script lang="ts">
  import Button from './Button.svelte'
  import { __$ } from './locales'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import ShowcaseCardImage from './ShowcaseCardImage.svelte'
  import ShowcaseCardRaw from './ShowcaseCardRaw.svelte'
  import SvgIcon from './SVGIcon.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import ArrowDown from '../assets/icons/arrow-down.svg'
  import { EndroMeta, GodStats } from './types/enga'
  import cn from 'classnames'
  import { goto } from '$app/navigation'
  import { screen$ } from './helpers/media-queries'
  import GodStat from './GodStat.svelte'
  import { listToMatrix } from './utils/list-to-matrix'

  export let endro: EndroMeta
  export let forSale: boolean

  let backfaceVisible = false
  let statsMatrix: GodStats[][]
  $: statsMatrix = listToMatrix(
    [GodStats.agg, GodStats.com, GodStats.con, GodStats.dex, GodStats.men, GodStats.str],
    $screen$.isMobile ? 2 : 3,
  )
</script>

<ShowcaseCardRaw bind:backfaceVisible>
  <span slot="title">{endro.title}</span>
  <span slot="subtitle" class="text-yellow-400 font-bold">
    {#if forSale}
      <WithCurrencyIcon iconDimensions="1rem">
        {formatCurrencyWithUnit(endro.marketPrice)}
      </WithCurrencyIcon>
    {/if}
  </span>
  <!-- BACKFACE -->
  <div
    slot="backface"
    class={cn(
      'w-full h-full bg-primary-800 rounded-xl flex flex-col p-4 text-text-secondary text-sm',
      forSale ? 'justify-between' : 'justify-evenly',
    )}
    on:click={() => (backfaceVisible = false)}>
    <div class="flex justify-between">
      <div class="flex space-x-1">
        <span>{$__$?.EngaVerse.endroSpecs.rarity}:</span>
        <span>{endro.rarity}</span>
      </div>
      <div class="flex space-x-1">
        <span>{$__$?.EngaVerse.endroSpecs.generation}:</span>
        <span>{endro.gen}</span>
      </div>
    </div>
    <div class="flex justify-between">
      <div class="flex space-x-1">
        <span>{$__$?.EngaVerse.endroSpecs.level}:</span>
        <span>{endro.level}</span>
        <span>/</span>
        <span>
          {$__$?.marketplace.endro.xpLeft(endro.xpLeft)}
        </span>
      </div>
      <div class="flex space-x-1">
        <span>{$__$?.EngaVerse.endroSpecs.zeal}:</span>
        <span>{endro.zeal}</span>
      </div>
    </div>
    <div class="h-0 border-b border-primary-600 my-4" />
    <div class="flex">
      <div class="flex flex-col grow justify-around space-y-1">
        {#if forSale && endro.lastSold}
          <div class="flex space-x-2">
            <span>
              {$__$?.marketplace.endro.lastSold}:
            </span>
            <WithCurrencyIcon iconDimensions="1rem">
              {formatCurrencyWithUnit(endro.lastSold)}
            </WithCurrencyIcon>
          </div>
        {/if}
        <div class="flex space-x-2">
          <span>
            {$__$?.EngaVerse.endroSpecs.powerSource}:
          </span>
          <WithCurrencyIcon iconDimensions="1rem">
            {formatCurrencyWithUnit(endro.powerSource)}
          </WithCurrencyIcon>
        </div>
      </div>
      <Button
        job={() => goto(`/endro/${endro.id}${forSale ? '#marketplace' : ''}`)}
        active
        className="!py-2.5">
        {forSale ? $__$?.marketplace.purchase : $__$?.dashboard.manage}
      </Button>
    </div>
  </div>
  <!-- LEFT -->
  <ShowcaseCardImage
    slot="left"
    image={endro.image}
    name={endro.title}
    endroMeta={{
      generation: endro.gen,
      level: endro.level,
      owner: forSale ? endro.owner : undefined,
      realm: endro.realm,
    }} />
  <div
    class="grid grid-flow-row grow text-text-secondary text-xs md:text-lg cursor-pointer"
    on:click={() => {
      $screen$.isMobile && (backfaceVisible = true)
      !$screen$.isMobile && goto(`/endro/${endro.id}#marketplace`)
    }}>
    <table class="md:table hidden">
      <tbody>
        <tr>
          <td width="100%">
            <div class="flex space-x-1">
              <span>
                {$__$?.EngaVerse.endroSpecs.rarity}:
              </span>
              <span>{endro.rarity}</span>
            </div>
          </td>
          <td>
            <div class="flex space-x-1">
              <span>
                {$__$?.EngaVerse.endroSpecs.zeal}:
              </span>
              <span>{endro.zeal}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td width="100%">
            <div class="flex space-x-1">
              <span>
                {$__$?.EngaVerse.endroSpecs.level}:
              </span>
              <span>{endro.level}</span>
              <span>/</span>
              <span>
                {$__$?.marketplace.endro.xpLeft(endro.xpLeft)}
              </span>
            </div>
          </td>
          <td>
            <div class="flex space-x-1">
              <span>
                {$__$?.EngaVerse.endroSpecs.generation}:
              </span>
              <span>{endro.gen}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="md:block hidden h-0 border-b border-primary-600 self-center" />
    <table class="self-center">
      <tbody>
        {#each statsMatrix as row}
          <tr>
            {#each row as statId}
              <td>
                <GodStat type={statId} value={endro.specs[statId]} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    <div class={cn('hidden md:flex text-sm self-end', forSale ? 'justify-between' : 'justify-end')}>
      <div class="flex space-x-2">
        <span>{$__$?.EngaVerse.endroSpecs.powerSource}:</span>
        <WithCurrencyIcon iconDimensions="1rem">
          {formatCurrencyWithUnit(endro.powerSource)}
        </WithCurrencyIcon>
      </div>
      {#if forSale && endro.lastSold}
        <div class="flex space-x-2">
          <span>{$__$?.marketplace.endro.lastSold}:</span>
          <WithCurrencyIcon iconDimensions="1rem">
            {formatCurrencyWithUnit(endro.lastSold)}
          </WithCurrencyIcon>
        </div>
      {/if}
    </div>
    <div class="flex md:hidden space-x-2 self-end">
      <span>{$__$?.marketplace.moreDetails}</span>
      <SvgIcon Icon={ArrowDown} className="-rotate-90" width="0.7rem" height="0.7rem" />
    </div>
  </div>
</ShowcaseCardRaw>
