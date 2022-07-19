<script lang="ts">
  import GodStat from '$lib/GodStat.svelte'
  import { screen$ } from '$lib/shared/helpers/media-queries'
  import { __$ } from '$lib/shared/locales'
  import { GodStats, Realms } from '$lib/shared/types/enga'
  import { keysOf } from '$lib/shared/utils/type-safe'
  import { EndroMeta } from '$lib/types/enga'
  import { listToMatrix } from '$lib/utils/list-to-matrix'
  import WithCurrencyIcon from '$lib/WithCurrencyIcon.svelte'
  import ShowcaseCardImage from '$lib/showcase-card/ShowcaseCardImage.svelte'
  import MeritPointIcon from '../shared/assets/icons/families-stats/merit-point.svg'
  import XpIcon from '../shared/assets/icons/families-stats/xp.svg'
  import ZealIcon from '../shared/assets/icons/families-stats/zeal.svg'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import { engaBalance$ } from '$lib/observables/enga/enga-balance'
  import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
  import WalletIcon from '$lib/shared/assets/icons/empty-wallet-add.svg'
  import JigglyCard from '$lib/shared/JigglyCard.svelte'
  import cn from 'classnames'

  export let meta: EndroMeta | undefined
  $: statsMatrix = listToMatrix(
    [GodStats.agg, GodStats.com, GodStats.con, GodStats.dex, GodStats.men, GodStats.str],
    $screen$.isMobile ? 2 : 3,
  )
  export let selected: boolean
  export let collateralMode = false
</script>

{#if meta}
  <div class="flex flex-col gap-2 md:gap-4">
    <div class="self-center">
      <JigglyCard>
        <ShowcaseCardImage
          className={{
            container: '!h-52 md:!h-72',
          }}
          image={meta.image}
          name={meta.title}
          endroMeta={{
            generation: meta.gen,
            level: meta.level,
            owner: '0x0000000000000000000000000000000000000000',
            realm: meta.realm,
          }} />
      </JigglyCard>
    </div>
    <div class="font-serif text-2xl text-center">{meta.title}</div>
    {#if !collateralMode}
      <div class="flex gap-2 items-center justify-evenly">
        <div class="flex gap-1 items-center">
          <SvgIcon Icon={ZealIcon} dontFill width="1.7rem" height="1.7rem" />
          <span class="whitespace-nowrap">
            {$__$.landing.realms.info[meta.realm].zealDefect}
          </span>
        </div>
        <div class="flex gap-1 items-center">
          <SvgIcon Icon={XpIcon} dontFill width="1.7rem" height="1.7rem" />
          <span class="whitespace-nowrap">
            {$__$.landing.realms.info[meta.realm].xp}
          </span>
        </div>
        <div class="flex gap-1 items-center">
          <SvgIcon Icon={MeritPointIcon} dontFill width="1.7rem" height="1.7rem" />
          <span class="whitespace-nowrap">
            {$screen$.isMobile
              ? $__$.landing.realms.info[meta.realm].meritPointsSum
              : $__$.landing.realms.info[meta.realm].meritPoints}
          </span>
        </div>
      </div>
      <span
        class={cn(
          'text-center',
          'transition-colors duration-500',
          selected ? 'text-yellow-400' : 'text-text-secondary',
        )}>
        {$__$.EngaVerse.endroSpecs.rarity}: {meta.rarity}
      </span>
      <table class="self-center">
        <tbody>
          {#each statsMatrix as row}
            <tr>
              {#each row as statId}
                <td class="md:py-2 px-3">
                  <GodStat type={statId} value={meta.specs[statId]} />
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
      <div
        class="flex md:gap-3 gap-2 justify-center items-center text-yellow-400 text-sm md:text-base">
        <span class="whitespace-nowrap">{$__$.EngaVerse.endroSpecs.powerSource}</span>
        <WithCurrencyIcon
          iconDimensions={$screen$.isMobile ? '1rem' : '1.3rem'}
          data={meta.powerSource} />
        {#if $screen$.isMobile && !collateralMode}
          <div class="flex gap-1 justify-center items-center text-text-secondary text-xs">
            <span>{`/`}</span>
            <SvgIcon Icon={WalletIcon} width="1rem" height="1rem" />
            <!-- DEBUG dummy value -->
            {$engaBalance$ ?? formatCurrencyWithUnit(23403.3)}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
