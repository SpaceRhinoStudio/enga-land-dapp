<script lang="ts">
  import cn from 'classnames'

  export let className: {
    [key in 'container' | 'wrapper' | 'backfaceWrapper']?: string
  } = {}
  export let backfaceVisible = false
  export let noHeightSet: boolean = false
  export let noWidthSet: boolean = false
  export let setHeightFrom: 'back' | 'front' | undefined = undefined
  export let setWidthFrom: 'back' | 'front' | undefined = undefined

  let backWidth: number, backHeight: number, frontWidth: number, frontHeight: number
</script>

<div
  class={cn('relative transition-all duration-1000', className?.container)}
  style={cn(
    'perspective: 800px;',
    !noHeightSet &&
      `height: ${
        setHeightFrom
          ? setHeightFrom === 'front'
            ? frontHeight
            : backHeight
          : backfaceVisible
          ? backHeight
          : frontHeight
      }px;`,
    !noWidthSet &&
      `width: ${
        setWidthFrom
          ? setWidthFrom === 'front'
            ? frontWidth
            : backWidth
          : backfaceVisible
          ? backWidth
          : frontWidth
      }px;`,
  )}>
  <div
    bind:clientHeight={frontHeight}
    bind:clientWidth={frontWidth}
    class={cn(
      'transition-all duration-1000 absolute top-0 left-0 will-change-transform transform-gpu',
      noHeightSet && 'bottom-0',
      setHeightFrom === 'back' && 'bottom-0',
      noWidthSet && 'right-0',
      setWidthFrom === 'back' && 'right-0',
      backfaceVisible ? 'opacity-0' : 'opacity-100',
      className?.wrapper,
    )}
    style="transform: {backfaceVisible ? 'rotateY(180deg)' : 'rotateY(0deg)'};">
    <slot />
  </div>
  <div
    bind:clientHeight={backHeight}
    bind:clientWidth={backWidth}
    class={cn(
      'transition-all duration-1000 absolute top-0 left-0 will-change-transform transform-gpu',
      noHeightSet && 'bottom-0',
      setHeightFrom === 'front' && 'bottom-0',
      noWidthSet && 'right-0',
      setWidthFrom === 'front' && 'right-0',
      backfaceVisible ? 'opacity-100' : 'opacity-0',
      className?.backfaceWrapper,
    )}
    style="backface-visibility: hidden; transform: {!backfaceVisible
      ? 'rotateY(-180deg)'
      : 'rotateY(0deg)'};">
    <slot name="backface" />
  </div>
</div>
