<script lang="ts">
  import { spring } from 'svelte/motion'
  import { canHover$ } from './helpers/media-queries'

  let measure: HTMLElement
  let whereTo = { x: 0, y: 0 }
  const x = spring(0, { damping: 1, stiffness: 0.1, precision: 0.1 })
  const y = spring(0, { damping: 1, stiffness: 0.1, precision: 0.1 })
  $: {
    x.set(whereTo.x)
    y.set(whereTo.y)
  }

  export let disabled = false
  export let className = ''
</script>

<div
  bind:this={measure}
  style="transform: perspective(800px) rotateX({$x}deg) rotateY({$y}deg);"
  class={className}
  on:mouseleave={() => {
    whereTo = {
      x: 0,
      y: 0,
    }
  }}
  on:mousemove={e => {
    if ($canHover$ && !disabled) {
      const { top, left, height, width } = measure.getBoundingClientRect()
      whereTo = {
        y: ((e.clientX - left) / width - 0.5) * 13,
        x: -((e.clientY - top) / height - 0.5) * 13,
      }
    }
  }}>
  <slot />
</div>
