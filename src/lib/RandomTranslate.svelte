<script lang="ts">
  import { spring } from 'svelte/motion'
  import { onDestroy, onMount } from 'svelte'
  import { useWobble } from './helpers/wobble-svelte'
  import _ from 'lodash'

  function calcNew(prev: { x: number; y: number }, width: number, height: number) {
    let randomX = (Math.random() - 0.5) * (width * 1.01)
    let randomY = (Math.random() - 0.5) * (height * 1.01)

    const newX =
      Math.abs(prev.x + randomX) > width * 1.01
        ? Math.sign(prev.x + randomX) * width * 0.5
        : prev.x + randomX
    const newY =
      Math.abs(prev.y + randomY) > height * 1.01
        ? Math.sign(prev.y + randomY) * height * 0.5
        : prev.y + randomY

    return {
      x: newX,
      y: newY,
    }
  }

  let width: number
  let height: number

  const [x, setX, springX] = useWobble({})
  const [y, setY, springY] = useWobble({})

  onMount(() => {
    springX.current.updateConfig({ mass: (height + width) * 3 })
    springY.current.updateConfig({ mass: (height + width) * 3 })
    const newX = _.throttle(
      (v: number, x: number) => {
        if (v < 0.001) {
          setX(calcNew({ x, y: 0 }, width, height).x)
        }
      },
      1000,
      { leading: true, trailing: true },
    )
    const newY = _.throttle(
      (v: number, y: number) => {
        if (v < 0.001) {
          setY(calcNew({ x: 0, y }, width, height).y)
        }
      },
      1000,
      { leading: true, trailing: true },
    )
    newX(0, 0)
    newY(0, 0)
    springX.current.onUpdate(x => {
      newX(x.currentVelocity, x.currentValue)
    })
    springY.current.onUpdate(y => {
      newY(y.currentVelocity, y.currentValue)
    })
  })

  export let className: string = ''
</script>

<div
  bind:clientWidth={width}
  bind:clientHeight={height}
  style="transform: translate({$x}px, {$y}px);"
  class="will-change-transform {className}">
  <slot x={10} y={10} />
</div>
