<script lang="ts">
  import _ from 'lodash'
  import { pxPerRem$ } from '$lib/helpers/px-rem-conversion'
  import { draw } from 'svelte/transition'

  export let className: string = ''
  export let Icon: any
  export let width: string | undefined
  export let height: string | undefined
  let pxWidth: number | undefined
  let pxHeight: number | undefined
  $: {
    pxWidth = _.isUndefined(width) ? undefined : parseFloat(width) * $pxPerRem$
    pxHeight = _.isUndefined(height) ? undefined : parseFloat(height) * $pxPerRem$
  }
  export let dontFill = false
</script>

<div class={`flex items-center justify-center ${className}`}>
  <svelte:component
    this={Icon}
    width={pxWidth}
    height={pxHeight}
    class={`
        ${!height ? 'h-full' : ''}
        ${!width ? 'w-full' : ''}
        ${!dontFill ? 'fillSVG' : ''}
        ${!dontFill ? 'fillStroke' : ''}
    `} />
</div>
