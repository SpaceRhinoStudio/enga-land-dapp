<script lang="ts">
  import LoadingOverlay from './shared/LoadingOverlay.svelte'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import SvgIcon from './shared/SVGIcon.svelte'
  import Fade from './Fade.svelte'
  import _ from 'lodash'
  import { createEventDispatcher } from 'svelte'
  import { __$ } from './shared/locales'

  export let isLoading = false
  export let disabled = false

  const dispatch = createEventDispatcher<{ change: string }>()

  let ref: HTMLSelectElement
  export let value: string | undefined = undefined

  $: itemTitles = !isLoading
    ? ref?.innerHTML
        ?.split('>')
        .map(x => x.split('<')[0])
        .filter(_.isString)
        .map(_.trim)
        .filter(_.negate(_.isEmpty))
    : undefined
  $: selectedItemTitle =
    ref?.innerHTML?.split(`${value}">`)[1]?.split('<')[0]?.trim() ?? $__$?.main.notAvailable

  export let className: { [key in 'container']?: string } = {}
</script>

<div
  class="relative flex bg-primary-600 rounded-lg py-1 pl-3 {className.container ?? ''} {disabled &&
    'text-opacity-50 text-text-secondary brightness-75'}">
  <select
    on:change={e => dispatch('change', e.currentTarget.value)}
    bind:this={ref}
    bind:value
    disabled={disabled || isLoading}
    class="opacity-0 absolute inset-0 outline-none {disabled
      ? 'cursor-not-allowed'
      : 'cursor-pointer'} z-[1]">
    {#if _.isNil(value)}
      <option value={'undefined'} disabled>
        {$__$?.main.notAvailable}
      </option>
    {/if}
    <slot />
  </select>
  {#each itemTitles ?? [] as itemTitle}
    <Fade mode="width" visible={selectedItemTitle === itemTitle}>
      <div class="pr-7 {isLoading ? 'text-transparent' : ''}">
        {itemTitle ?? $__$?.main.notAvailable}
      </div>
    </Fade>
  {/each}
  <Fade mode="width" visible={!itemTitles?.length}>
    <div class="pr-7 {isLoading ? 'text-transparent' : ''}">
      {$__$?.main.notAvailable}
    </div>
  </Fade>
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
