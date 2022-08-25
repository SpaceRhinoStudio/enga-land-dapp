<script lang="ts">
  import _ from 'lodash'
  import cn from 'classnames'
  import { fly } from 'svelte/transition'
  import { canHover$, screen$ } from '$lib/shared/helpers/media-queries'
  import { __$ } from '$lib/shared/locales'
  import ArrowCircleLeftIcon from '../../lib/shared/assets/icons/vuesax-linear-arrow-circle-left.svg'
  import ArrowCircleRightIcon from '../../lib/shared/assets/icons/vuesax-linear-arrow-circle-right.svg'
  import { tsFix } from '$lib/shared/helpers/svelte-animation-fix'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import { genArr } from '$lib/shared/utils/random'

  export let prev: () => void
  export let next: () => void
  export let curr: number
  export let length: number

  $: dots = genArr(length ?? 0, i => i)
  let lastAction = 'next' as 'next' | 'prev'

  export let className: { [key in 'container']?: string } = {}
</script>

<div
  class="w-full flex flex-col-reverse md:flex-row items-center gap-4 md:justify-between pt-2 md:py-0 {className.container}">
  <div
    class="flex relative h-[6.5vh] md:h-7 items-center md:gap-3 w-full md:w-fit justify-between text-xl md:text-base">
    <SvgIcon
      on:click={() => {
        lastAction = 'prev'
        prev()
      }}
      className={cn(
        'h-full aspect-square transition-all text-text-hover cursor-pointer px-3 md:px-0',
        $canHover$ && 'hover:scale-125',
      )}
      Icon={ArrowCircleLeftIcon}
      height={undefined}
      width={undefined} />
    <div class="flex gap-6 md:gap-3 h-full">
      <div class="relative w-4 h-full flex">
        {#each dots.filter(x => x === curr) as current (current)}
          <span
            in:tsFix={[fly, { x: lastAction === 'next' ? 20 : -20 }]}
            out:tsFix={[fly, { x: lastAction === 'next' ? -20 : 20 }]}
            class="text-text-hover absolute inset-0 text-base flex items-center justify-center">
            {current + 1}
          </span>
        {/each}
      </div>
      <div class="h-full border-r border-r-primary-600" />
      <span class="text-text-secondary text-base flex items-center justify-center">
        {length}
      </span>
    </div>
    <SvgIcon
      on:click={() => {
        lastAction = 'next'
        next()
      }}
      className={cn(
        'h-full aspect-square transition-all text-text-hover cursor-pointer px-3 md:px-0',
        $canHover$ && 'hover:scale-125',
      )}
      Icon={ArrowCircleRightIcon}
      height={undefined}
      width={undefined} />
  </div>
  <div
    class="text-text-secondary flex items-center relative h-3"
    style="width: {dots.length * 0.8}rem;">
    {#each dots as dot, i (dot)}
      <div
        style="right: {(dots.length - 1 - dot) * 0.8}rem;"
        class={cn(
          'absolute aspect-square rounded-full bg-current w-1.5 transition-all',
          dot === curr && 'scale-150 text-text-hover',
        )} />
    {/each}
  </div>
</div>
