<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition'
  import { quartInOut } from 'svelte/easing'

  export let visible: boolean
  export let mode: 'height' | 'width' | 'both'
  export let className: { [key in 'container' | 'wrapper']?: string } = {}
  let width: number
  let height: number
  export let style = ''
  export let duration = 500

  function customTransition(
    node: HTMLElement,
    {
      duration,
      mode,
      height,
      width,
    }: {
      duration: number
      mode: 'height' | 'width' | 'both'
      height: number
      width: number
    },
  ): TransitionConfig {
    return {
      duration,
      css: t => {
        const eased = quartInOut(t)
        return `
					${mode === 'height' || mode === 'both' ? `height: ${eased * height}px;` : ''}
					${mode === 'width' || mode === 'both' ? `width: ${eased * width}px;` : ''}
					opacity: ${eased};
				`
      },
    }
  }
</script>

{#if visible}
  <div
    transition:customTransition={{ duration, mode, height, width }}
    class="{mode === 'both' || mode === 'height' || mode === 'width'
      ? 'overflow-hidden '
      : ''}{className.container ?? ''}"
    {style}>
    <div
      class="{className.wrapper ?? 'p-px'} {mode === 'width' || mode === 'both'
        ? 'w-auto min-w-max'
        : ''}"
      bind:clientHeight={height}
      bind:clientWidth={width}>
      <slot />
    </div>
  </div>
{/if}
