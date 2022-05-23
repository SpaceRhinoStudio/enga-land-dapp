<script lang="ts">
  import LoadingOverlay from './LoadingOverlay.svelte'
  import ArrowDown from '../assets/icons/arrow-down.svg'
  import SvgIcon from './SVGIcon.svelte'
  import Fade from './Fade.svelte'
  import _ from 'lodash'
  import { createEventDispatcher } from 'svelte'

  export let isLoading = false
  export let disabled = false

  const dispatch = createEventDispatcher<{ change: string }>()

  let ref: HTMLSelectElement
  export let value: string | undefined = undefined
  let itemTitles: string[]
  $: itemTitles =
    ref?.innerHTML
      ?.split('">')
      .map(x => x.split('<')[0])
      .filter(_.isString)
      .filter(x => x?.length) ?? []

  let selectedItemTitle: string
  $: selectedItemTitle = ref?.innerHTML?.split(`${value}">`)[1]?.split('<')[0] ?? ''
  export let className: { [key in 'container']?: string } = {}
</script>

<div class="relative flex mx-2 bg-primary-600 rounded-lg py-1 pl-3 {className.container ?? ''}">
  <select
    on:change={e => dispatch('change', e.currentTarget.value)}
    bind:this={ref}
    bind:value
    disabled={disabled || isLoading}
    class="opacity-0 absolute inset-0 outline-none cursor-pointer bg-primary-800 z-[1]">
    <slot />
  </select>
  {#each itemTitles ?? [] as itemTitle}
    <Fade mode="width" visible={selectedItemTitle === itemTitle}>
      <div class="pr-7 {isLoading ? 'text-transparent' : ''}">
        {itemTitle}
      </div>
    </Fade>
  {/each}
  <SvgIcon
    Icon={ArrowDown}
    className={`
      absolute
      -right-0.5
      top-1/2
      -translate-y-1/2
      -translate-x-1/2
      pointer-events-none
      select-none
      ${isLoading ? 'text-transparent' : ''}
    `}
    width={'1rem'}
    height={'1rem'} />
  <LoadingOverlay visible={!!isLoading} />
</div>
