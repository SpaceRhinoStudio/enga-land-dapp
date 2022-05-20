<script lang="ts">
  import { spring } from 'svelte/motion'
  import { onDestroy } from 'svelte'

  function calcNew(prev: { x: number; y: number }, width: number, height: number) {
    let randomX = (Math.random() - 0.5) * (width / 2)
    // randomX = Math.abs(randomX) > width / 3 ? (width / 3) * Math.sign(randomX) : randomX
    let randomY = (Math.random() - 0.5) * (height / 2)
    // randomY = Math.abs(randomY) > width / 3 ? (width / 3) * Math.sign(randomY) : randomY

    // const newX = Math.abs(prev.x + randomX) > width * 1.3 ? prev.x - randomX : prev.x + randomX
    // const newY = Math.abs(prev.y + randomY) > height * 1.3 ? prev.y - randomY : prev.y + randomY

    return {
      x: randomX,
      y: randomY,
    }
  }

  let whereTo = { x: 0, y: 0 }
  let width: number
  let height: number

  const x = spring(0, { damping: 1, stiffness: 0.0005, precision: 0.1 })
  const y = spring(0, { damping: 1, stiffness: 0.0005, precision: 0.1 })

  $: x.set(whereTo.x + Math.sign(whereTo.x) * 50)
  $: y.set(whereTo.y + Math.sign(whereTo.y + 50))

  const interval = setInterval(() => (whereTo = calcNew(whereTo, width, height)), 1000)
  onDestroy(() => clearInterval(interval))

  export let className: string = ''
</script>

<div
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="transform: translate({$x}px, {$y}px);"
  class="will-change-transform {className}">
  <slot x={10} y={10} />
</div>
