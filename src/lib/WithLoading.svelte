<script lang="ts">
  import _ from 'lodash'
  import { flip } from 'svelte/animate'
  import { crossfade, TransitionConfig } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { isSentinel } from './contexts/empty-sentinel'
  import LoadingSpinner from './LoadingSpinner.svelte'

  export let data: unknown
  export let predicate: (data: unknown) => boolean = e => !isSentinel(e) && !_.isUndefined(e)
  export let className: {
    [key in 'container' | 'wrapper' | 'spinner' | 'spinnerWrapper']?: string
  } = {}

  let children: ('loading' | 'data' | 'before' | 'after')[]
  $: children = predicate(data) ? ['before', 'data', 'after'] : ['before', 'loading', 'after']

  const customTransition = (node: HTMLElement, params: { duration?: number }): TransitionConfig => {
    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform

    return {
      duration: params.duration ?? 600,
      easing: quintOut,
      css: t => `
					transform: ${transform} translateX(${(t - 1) * 25}px);
					opacity: ${t}
				`,
    }
  }
</script>

<div class="flex gap-1 {className.container}">
  {#each children as x (x)}
    <div transition:customTransition animate:flip class={className.wrapper}>
      {#if x === 'before'}
        <slot name="before" />
      {/if}
      {#if x === 'loading'}
        <div class={className.spinnerWrapper ?? ''}>
          <LoadingSpinner className={className.spinner ?? ''} />
        </div>
      {/if}
      {#if x === 'data'}
        <slot name="data" {data} />
      {/if}
      {#if x === 'after'}
        <slot name="after" />
      {/if}
    </div>
  {/each}
</div>
