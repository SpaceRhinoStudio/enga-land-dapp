<script lang="ts">
  import { SpringConfig } from 'wobble'
  import { resize_observer } from './actions/resize-observer'
  import { useWobble } from './helpers/wobble-svelte'

  export let visible: boolean
  export let mode: 'height' | 'width' | 'both' | 'opacity'
  export let className: { [key in 'container' | 'wrapper']?: string } = {}
  export let width: number | undefined = undefined
  export let height: number | undefined = undefined
  export let springOptions: Partial<SpringConfig> = { fromValue: 0, stiffness: 1, damping: 1000 }
  //TODO add this back
  // export let startFromZero = false
  export let delay = 0
  export let style = ''

  const [containerWidth, setContainerWidth] = useWobble(springOptions)
  const [containerHeight, setContainerHeight] = useWobble(springOptions)
  const [opacity, setOpacity] = useWobble(springOptions)

  $: setTimeout(() => {
    if ((mode === 'height' || mode == 'both') && height !== undefined) {
      setContainerHeight(visible ? height : 0)
    }
  }, delay)

  $: setTimeout(() => {
    if ((mode === 'width' || mode === 'both') && width !== undefined) {
      setContainerWidth(visible ? width : 0)
    }
  }, delay)

  $: setTimeout(() => {
    setOpacity(visible ? 1 : 0)
  }, delay)

  export let isRendering = visible
  $: isRendering =
    visible ||
    (mode === 'opacity'
      ? $opacity !== 0
      : mode === 'width'
      ? $containerWidth !== 0 || width === undefined
      : mode === 'height'
      ? $containerHeight !== 0 || height === undefined
      : mode === 'both'
      ? $containerWidth !== 0 ||
        $containerHeight !== 0 ||
        width === undefined ||
        height === undefined
      : false)

  let widthStyle = ''
  $: widthStyle = mode === 'width' || mode === 'both' ? `width: ${$containerWidth}px; ` : ''

  let heightStyle = ''
  $: heightStyle = mode === 'height' || mode === 'both' ? `height: ${$containerHeight}px;` : ''

  let willChangeStyle = ''
  $: willChangeStyle = `will-change: ${mode === 'width' || mode === 'both' ? 'width, ' : ''}${
    mode === 'height' || mode === 'both' ? 'height, ' : ''
  }opacity; `

  let opacityStyle = ''
  $: opacityStyle = `opacity: ${$opacity}; `
</script>

{#if isRendering}
  <div
    class="{mode === 'both'
      ? 'overflow-hidden'
      : mode === 'height'
      ? 'overflow-y-hidden'
      : mode === 'width'
      ? 'overflow-x-hidden'
      : ''} {className.container ?? ''}"
    style="{widthStyle}{heightStyle}{willChangeStyle}{opacityStyle}{style}">
    <div
      class="{className.wrapper ?? 'p-px'} {mode === 'width' || mode === 'both'
        ? 'w-auto min-w-max'
        : ''}"
      use:resize_observer
      on:resize={e => {
        height = e.detail.height
        width = e.detail.width
      }}>
      <slot />
    </div>
  </div>
{/if}
