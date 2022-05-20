<script lang="ts">
  import { onDestroy } from 'svelte'

  import { spring } from 'svelte/motion'
  import { resize_observer } from './actions/resize-observer'
  import { zeroIfNegative } from './utils/zero'

  interface SpringOpts {
    stiffness?: number
    damping?: number
    precision?: number
  }

  export let visible: boolean
  export let mode: 'height' | 'width' | 'both' | 'opacity'
  export let className: { [key in 'container' | 'wrapper']?: string } = {}
  export let width: number | undefined = undefined
  export let height: number | undefined = undefined
  export let springOptions: SpringOpts = { damping: 1, stiffness: 0.1, precision: 0.1 }
  export let startFromZero = false
  export let delay = 0
  export let style = ''

  let isTimeoutOver = delay === 0 ? true : false
  let introTimeout: NodeJS.Timeout | undefined =
    delay !== 0
      ? setTimeout(() => {
          isTimeoutOver = true
          containerWidth.set(startFromZero ? 0 : width)
          containerHeight.set(startFromZero ? 0 : height)
        }, delay)
      : undefined

  onDestroy(() => clearTimeout(introTimeout))

  export const containerWidth = spring<number | undefined>(startFromZero ? 0 : width, springOptions)
  export const containerHeight = spring<number | undefined>(
    startFromZero ? 0 : height,
    springOptions,
  )
  export const opacity = spring<number>(startFromZero ? 0 : visible ? 1 : 0)

  $: isTimeoutOver &&
    (mode === 'height' || mode == 'both') &&
    height !== undefined &&
    containerHeight.set(visible ? height : 0)

  $: isTimeoutOver &&
    (mode === 'width' || mode === 'both') &&
    width !== undefined &&
    containerWidth.set(visible ? width : 0)

  $: isTimeoutOver && mode === 'opacity' && opacity.set(visible ? 1 : 0)

  export let isRendering = visible
  $: isRendering =
    mode === 'opacity'
      ? zeroIfNegative($opacity) !== 0
      : mode === 'width'
      ? zeroIfNegative($containerWidth) !== 0 || width === undefined
      : mode === 'height'
      ? zeroIfNegative($containerHeight) !== 0 || height === undefined
      : mode === 'both'
      ? zeroIfNegative($containerWidth) !== 0 ||
        zeroIfNegative($containerHeight) !== 0 ||
        width === undefined ||
        height === undefined
      : false

  let widthStyle = ''
  $: widthStyle =
    mode === 'width' || mode === 'both' ? `width: ${zeroIfNegative($containerWidth)}px; ` : ''

  let heightStyle = ''
  $: heightStyle =
    mode === 'height' || mode === 'both' ? `height: ${zeroIfNegative($containerHeight)}px;` : ''

  let willChangeStyle = ''
  $: willChangeStyle = `will-change: ${mode === 'width' || mode === 'both' ? 'width, ' : ''}${
    mode === 'height' || mode === 'both' ? 'height, ' : ''
  }opacity; `

  let opacityStyle = ''
  $: opacityStyle = `opacity: ${mode === 'opacity' ? $opacity : ''}${
    mode === 'height' || mode === 'both'
      ? zeroIfNegative($containerHeight ?? 1) / (height ?? 1)
      : ''
  }${mode === 'width' ? zeroIfNegative($containerWidth ?? 1) / (width ?? 1) : ''}; `
</script>

{#if isRendering}
  <div
    class="{mode === 'both' || mode === 'height' || mode === 'width'
      ? 'overflow-hidden '
      : ''}{className.container ?? ''}"
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
