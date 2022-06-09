<script lang="ts">
  import cn from 'classnames'
  import { slide } from 'svelte/transition'

  import ClickState from './ClickState.svelte'
  import Fade from './Fade.svelte'
  import HoverState from './HoverState.svelte'

  export let upward: boolean = false
  export let className: { [key in 'container' | 'dropContainer' | 'dropWrapper']?: string } = {}
  export let canExpand = true
  export let dir: 'ltr' | 'rtl' = 'ltr'
  export let noSlide = false
  export let noHover = false

  let shouldLeave = false
  let hoverState: boolean
  let clickState: boolean
  let dismissClick: () => void

  function dismiss() {
    if (!noHover) {
      shouldLeave = true
    }
    dismissClick()
  }

  $: !hoverState && (shouldLeave = false)
  $: isDropped = ((!noHover && hoverState) || clickState) && !shouldLeave && canExpand
</script>

<div class="relative flex items-center {className.container ?? ''}">
  <HoverState bind:hoverState>
    <ClickState bind:clickState bind:dismiss={dismissClick}>
      <slot {dismiss} {isDropped} />
      <svelte:fragment slot="exclude">
        {#if isDropped}
          <div
            in:slide={noSlide ? { easing: () => 1 } : {}}
            out:slide={noSlide ? { easing: () => 0 } : {}}
            class={cn(
              'absolute z-30',
              upward ? 'bottom-full -translate-y-3' : 'top-full translate-y-3',
              dir === 'ltr' ? 'left-0' : 'right-0',
              className.dropContainer,
              'shadow-xl shadow-[#0008] bg-primary-900 rounded-xl',
            )}>
            {#if isDropped}
              <slot name="drop" {dismiss} />
            {/if}
          </div>
        {/if}
      </svelte:fragment>
    </ClickState>
  </HoverState>
</div>
