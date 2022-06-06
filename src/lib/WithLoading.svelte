<script lang="ts">
  import _ from 'lodash'
  import { flip } from 'svelte/animate'
  import { fade, TransitionConfig } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { isSentinel } from './contexts/empty-sentinel'
  import LoadingSpinner from './LoadingSpinner.svelte'
  import { tick } from 'svelte'

  export let data: unknown
  export let passSentinel = false
  export let predicate: (data: unknown) => boolean = e =>
    _.castArray(e).every(e => !_.isUndefined(e) && (!passSentinel ? !isSentinel(e) : true))
  export let className: {
    [key in 'container' | 'wrapper' | 'spinner' | 'spinnerWrapper']?: string
  } = {}

  const customTransition = (node: HTMLElement, params: { duration?: number }): TransitionConfig => {
    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform

    return {
      duration: params.duration ?? 600,
      easing: quintOut,
      css: t => `
					transform: ${transform} translateX(${(t - 1) * 25}px);
					opacity: ${t};
				`,
    }
  }

  const before = $$slots.before ? ['before'] : []
  const after = $$slots.after ? ['after'] : []
  let isAnimatingLoading = false
  let isAnimatingData = false

  let children = [...before, predicate(data) ? 'data' : 'loading', ...after]

  const updateChildren = _.throttle(
    (isDataValid: boolean, isAnimatingLoading: boolean, isAnimatingData: boolean) => {
      if (isDataValid) {
        if (children.includes('loading')) {
          children = [...before, 'loading', 'data', ...after]
          tick().then(() => {
            if (!isAnimatingLoading) {
              children = [...before, 'data', ...after]
            }
          })
        }
      } else {
        // children = [...before, 'loading', ...after]
        if (children.includes('data')) {
          children = [...before, 'loading', 'data', ...after]
          tick().then(() => {
            if (!isAnimatingData) {
              children = [...before, 'loading', ...after]
            }
          })
        }
      }
    },
    1000,
    { leading: true, trailing: true },
  )

  $: updateChildren(predicate(data), isAnimatingLoading, isAnimatingData)
</script>

<div class="flex gap-1 items-center {className.container}">
  {#each children as key (key)}
    <div
      in:fade
      out:customTransition
      on:introstart={() => {
        key === 'loading' && (isAnimatingLoading = true)
        key === 'data' && (isAnimatingData = true)
      }}
      on:introend={() => {
        key === 'loading' && (isAnimatingLoading = false)
        key === 'data' && (isAnimatingData = false)
      }}
      animate:flip={{ duration: 600 }}
      class={className.wrapper ?? ''}>
      {#if key === 'before'}
        <slot name="before" />
      {/if}
      {#if key === 'loading'}
        <div class={className.spinnerWrapper ?? ''}>
          <LoadingSpinner className={className.spinner ?? ''} />
        </div>
      {/if}
      {#if key === 'data'}
        <slot name="data" {data} />
      {/if}
      {#if key === 'after'}
        <slot name="after" />
      {/if}
    </div>
  {/each}
</div>
