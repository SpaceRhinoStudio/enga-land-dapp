<script lang="ts">
  import _ from 'lodash'
  import { flip } from 'svelte/animate'
  import { crossfade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { isSentinel } from './contexts/empty-sentinel'
  import LoadingSpinner from './LoadingSpinner.svelte'

  export let data: unknown
  export let predicate: (data: unknown) => boolean = e => !isSentinel(e) && !_.isUndefined(e)
  export let className: {
    [key in 'container' | 'wrapper' | 'spinner']?: string
  } = {}

  let children: ('loading' | 'data' | 'before' | 'after')[]
  $: children = predicate(data) ? ['before', 'data', 'after'] : ['before', 'loading', 'after']

  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node)
      const transform = style.transform === 'none' ? '' : style.transform

      return {
        duration: 600,
        easing: quintOut,
        css: t => `
					transform: ${transform} translateX(${(t - 1) * 25}px);
					opacity: ${t}
				`,
      }
    },
  })
</script>

<div class={className.container}>
  {#each children as x (x)}
    <div in:receive={{ key: x }} out:send={{ key: x }} animate:flip class={className.wrapper}>
      {#if x === 'before'}
        <slot name="before" />
      {/if}
      {#if x === 'loading'}
        <LoadingSpinner className={className.spinner ?? ''} />
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
