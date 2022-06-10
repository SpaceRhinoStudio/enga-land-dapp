<script lang="ts" context="module">
  import { EndroItemMeta, EndroItemType, GodStats, ItemRarity, Realms } from './types/enga'
  import KomorebiIcon from './shared/assets/icons/realms/komorebi.svg'
  import MagestaIcon from './shared/assets/icons/realms/magesta.svg'
  import NubiaIcon from './shared/assets/icons/realms/nubia.svg'
  import SigrIcon from './shared/assets/icons/realms/sigr.svg'
  import UfmIcon from './shared/assets/icons/realms/ufm.svg'

  const realmsIconMap = {
    [Realms.komorebi]: KomorebiIcon,
    [Realms.magesta]: MagestaIcon,
    [Realms.nubia]: NubiaIcon,
    [Realms.sigr]: SigrIcon,
    [Realms.ufm]: UfmIcon,
  }
</script>

<script lang="ts">
  import CardCut from './CardCut.svelte'
  import ChipsetItemImage from './ChipsetItemImage.svelte'
  import GodStat from './GodStat.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import { __$ } from './locales'
  import ShortenedHash from './ShortenedHash.svelte'
  import SvgIcon from './shared/SVGIcon.svelte'
  import cn from 'classnames'
  import { config } from './configs'
  import { ItemRarityBackgroundClassNames } from './RarityMaps.svelte'
  import LightReflection from '../assets/cards/light-reflection.png'
  import Pattern from '../assets/cards/pattern.png'
  import OpifexOff from '../assets/cards/opifex-off.svg'
  import OpifexOn from '../assets/cards/opifex-on.svg'
  import _ from 'lodash'
  import { listToMatrix } from './utils/list-to-matrix'
  import { keysOf } from './utils/type-safe'
  import { goto } from '$app/navigation'

  export let image: string | undefined = undefined
  export let name: string
  export let endroMeta:
    | {
        generation: number
        level: number
        realm: Realms
        owner?: string | undefined
      }
    | undefined = undefined
  export let itemMeta: EndroItemMeta | undefined = undefined
  export let opifexMeta:
    | {
        generation: number
        isIndexed: boolean
      }
    | undefined = undefined

  let height: number

  let bgClassName = cn(
    'bg-gradient-to-tr',
    (endroMeta || opifexMeta) && 'from-blue-900 via-teal-700 to-blue-900',
    itemMeta?.rarity && ItemRarityBackgroundClassNames[itemMeta.rarity],
  )

  const chipsetModifiers = itemMeta?.modifiers
    ? listToMatrix(
        keysOf(GodStats).reduce(
          (acc, curr) => (itemMeta?.modifiers![curr] ? [...acc, GodStats[curr]] : acc),
          [] as GodStats[],
        ),
        2,
      )
    : undefined
</script>

<div
  bind:clientHeight={height}
  class={cn(
    'flex relative z-[1] w-48 md:w-auto -mr-1 md:-mr-1.5',
    itemMeta?.type === EndroItemType.chipset ? 'h-36 md:h-72' : 'h-40 md:h-72',
  )}>
  <div
    style={cn(
      ((itemMeta?.rarity && itemMeta?.rarity !== ItemRarity.common) || endroMeta) &&
        `box-shadow: 0px 0px ${height / 3}px ${height / 30}px ${
          config.colors.rarity[itemMeta?.rarity ?? ItemRarity.common]
        }`,
      'mix-blend-mode: unset',
    )}
    class="absolute z-[-1] right-1 top-1/2 -translate-y-1/2 bottom-1/4 left-3/4 rounded-full" />
  {#if !$screen$.isMobile}
    <div class={cn(bgClassName, 'w-40 rounded-2xl md:rounded-[1.8rem] -mr-40')} />
  {/if}
  <CardCut
    cutHeight={$screen$.isMobile ? '0.7rem' : '1.3rem'}
    hScale={$screen$.isMobile ? 1 : 1.3}
    cornerRadius={$screen$.isMobile ? '0.9rem' : '1.7rem'}
    mode="outCutRight"
    className={{
      container: 'md:w-56 w-full h-full md:my-3 md:ml-3 md:h-auto',
      wrapper: 'h-full w-full relative overflow-hidden group flex',
    }}>
    <div
      class={cn('h-full w-full p-1 md:p-2', $screen$.isMobile ? bgClassName : 'bg-text-primary')}>
      <CardCut
        mode="outCutRight"
        cutHeight={$screen$.isMobile ? '0.5rem' : '1.3rem'}
        hScale={$screen$.isMobile ? 0.9 : 1.3}
        cornerRadius={$screen$.isMobile ? '0.7rem' : '1.6rem'}
        className={{
          container: 'w-full h-full #pr-px md:pr-0',
          wrapper: 'w-full h-full',
        }}>
        <div class="h-full w-full p-px bg-neutral-200">
          {#if image || opifexMeta || itemMeta?.image || itemMeta?.type === EndroItemType.chipset}
            <CardCut
              cutHeight={$screen$.isMobile ? '0.4rem' : '1.1rem'}
              hScale={$screen$.isMobile ? 0.9 : 1.3}
              cornerRadius={$screen$.isMobile ? '0.65rem' : '1.4rem'}
              className={{
                container: 'h-full w-full #pr-px md:pr-0',
                wrapper: cn(
                  'h-full w-full relative z-[2] flex flex-col',
                  endroMeta ? 'bg-text-secondary justify-end' : 'justify-center',
                  opifexMeta && 'bg-[#ACEBFC]',
                  itemMeta?.type === EndroItemType.chipset && 'bg-neutral-800',
                  image && itemMeta && 'bg-text-secondary',
                ),
              }}
              mode="outCutRight">
              <img
                class="absolute z-0 inset-0 object-cover scale-[200%] origin-top md:scale-100"
                src={Pattern}
                alt=""
                style="mix-blend-mode: multiply;" />
              {#if image}
                <img
                  alt={name}
                  src={image}
                  style={cn(
                    endroMeta &&
                      `mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,0));
                          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,0));`,
                  )}
                  class={cn(
                    'relative z-[1] object-contain max-w-full max-h-full mr-3',
                    itemMeta && 'px-5 md:px-14',
                  )} />
              {/if}
              {#if opifexMeta}
                <SvgIcon
                  Icon={opifexMeta.isIndexed ? OpifexOn : OpifexOff}
                  className="relative z-[1] max-w-full max-h-full mr-3 py-4 md:py-6"
                  dontFill
                  width={undefined}
                  height={undefined} />
              {/if}
              {#if itemMeta?.type === EndroItemType.chipset}
                <div
                  class="relative z-[1] max-w-full max-h-full mr-3 flex flex-col h-full py-1 md:py-2.5">
                  <div class="flex w-full justify-center items-center">
                    {#each chipsetModifiers?.[0] ?? [] as x}
                      <GodStat
                        dimensions={$screen$.isMobile ? undefined : '2.5rem'}
                        alwaysDesktop
                        justIcon
                        type={x} />
                    {/each}
                  </div>
                  <ChipsetItemImage
                    rarity={itemMeta.rarity}
                    className="px-6 md:px-10 mb-0.5 md:mb-2 md:mt-0.5" />
                  <div class="flex w-full justify-center items-center">
                    {#each chipsetModifiers?.[1] ?? [] as x}
                      <GodStat
                        dimensions={$screen$.isMobile ? undefined : '2.5rem'}
                        alwaysDesktop
                        justIcon
                        type={x} />
                    {/each}
                  </div>
                </div>
              {/if}
              <img
                src={LightReflection}
                alt=""
                class="absolute z-[2] inset-0 object-cover"
                style="mix-blend-mode: soft-light;" />
            </CardCut>
          {/if}
          {#if endroMeta}
            <div
              class="absolute top-2 md:top-4 left-2.5 md:left-4 flex flex-col text-base md:text-lg md:-space-y-1.5 -space-y-1.5"
              style="font-family: Bahnschrift;">
              <div class="flex flex-col items-center md:-space-y-3 -space-y-2.5">
                <span class="font-bold">
                  {endroMeta.generation.toString().padStart(2, '0')}
                </span>
                <span class="text-2xs -mt-0.5 tracking-tighter md:tracking-normal">
                  {$__$?.marketplace.endro.generationLabel}
                </span>
              </div>
              <div class="flex flex-col md:-space-y-3 -space-y-2.5">
                <span class="font-bold">
                  {endroMeta.level.toString().padStart(2, '0')}
                </span>
                <span class="text-2xs -mt-0.5">
                  {$__$?.marketplace.endro.levelLabel}
                </span>
              </div>
            </div>
          {/if}
          {#if endroMeta}
            <div class="absolute top-3 md:top-4 right-6 md:right-8">
              <SvgIcon
                Icon={realmsIconMap[endroMeta.realm]}
                height={$screen$.isMobile ? '1.5rem' : '2rem'}
                width={$screen$.isMobile ? '1.5rem' : '2rem'}
                dontFill />
            </div>
          {/if}
          {#if endroMeta?.owner}
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3]">
              <div
                class="hidden md:flex space-x-1 text-sm border border-white rounded-lg px-2 py-1 backdrop-blur-sm bg-black bg-opacity-30 text-text-hover shadow-lg shadow-[#0005] select-none mr-3 cursor-pointer hover:scale-110 transition-transform"
                on:click={() => goto(`/dashboard#${endroMeta?.owner}`)}>
                <span>
                  {$__$?.marketplace.ownerTitle}:
                </span>
                <ShortenedHash hash={endroMeta.owner} />
              </div>
            </div>
          {/if}
        </div>
      </CardCut>
    </div>
  </CardCut>
</div>
