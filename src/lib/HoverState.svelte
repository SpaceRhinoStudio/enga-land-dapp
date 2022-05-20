<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { config } from './configs'
  import { canHover$ } from './helpers/media-queries'

  let dispatch = createEventDispatcher<{ hover: boolean }>()

  export let hoverState = false
  export let shouldLeave = false
</script>

<div
  class="contents"
  on:pointerenter={() => {
    if ($canHover$) {
      shouldLeave = false
      hoverState = true
      dispatch('hover', true)
    }
  }}
  on:pointerleave={() => {
    if ($canHover$) {
      shouldLeave = true
      setTimeout(() => {
        if (shouldLeave) {
          hoverState = false
          dispatch('hover', false)
        }
      }, config.Delays.min)
    }
  }}>
  <slot {hoverState} {shouldLeave} />
</div>
