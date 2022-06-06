<script lang="ts">
  import _ from 'lodash'
  import { canHover$ } from './helpers/media-queries'
  import { useWobble } from './helpers/wobble-svelte'

  function computeOpacity(full: number | undefined, current: number | undefined): number {
    return Math.abs(1 - Math.abs((full ?? 0) / 2 - (current ?? 0)) / (((full ?? 1) * 1) / 2))
  }

  export let fadeOutAtEdge = true

  let viewportHeight: number = 0
  let viewportWidth: number = 0
  let mousePosition: { x: number; y: number } = { x: 0, y: 0 }
  $: mousePosition = { x: viewportWidth / 2, y: viewportHeight / 2 }
  let [x, setX] = useWobble({ damping: 2.5, stiffness: 3, fromValue: mousePosition.x })
  let [y, setY] = useWobble({ damping: 2.5, stiffness: 3, fromValue: mousePosition.y })
  $: {
    setX(mousePosition.x)
    setY(mousePosition.y)
  }
  let opacity = 1
  $: fadeOutAtEdge &&
    (opacity = Math.min(computeOpacity(viewportHeight, $y), computeOpacity(viewportWidth, $x)))

  let height = 0
  let width = 0
</script>

<svelte:window
  bind:innerHeight={viewportHeight}
  bind:innerWidth={viewportWidth}
  on:pointermove={_.throttle(e => (mousePosition = { x: e.clientX, y: e.clientY }), 50, {
    leading: true,
    trailing: true,
  })} />

{#if $canHover$}
  <div
    data-name="follow-mouse"
    bind:clientHeight={height}
    bind:clientWidth={width}
    style="opacity: {opacity}; transform: translate({$x - width / 2}px, {$y -
      height / 2}px); will-change: transform, opacity;"
    class="fixed top-0 left-0 pointer-events-none select-none">
    <slot />
  </div>
{/if}
