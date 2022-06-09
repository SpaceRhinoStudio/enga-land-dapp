<script lang="ts">
  import cn from 'classnames'
  import { slide } from 'svelte/transition'
  import { portal } from './actions/portal'
  import { resize_observer } from './actions/resize-observer'

  import ClickState from './ClickState.svelte'
  import HoverState from './HoverState.svelte'

  export let upward: boolean = false
  export let className: { [key in 'container' | 'dropContainer' | 'dropWrapper']?: string } = {}
  export let canExpand = true
  export let dir: 'ltr' | 'rtl' = 'ltr'
  export let noSlide = false
  export let noHover = false
  export let usePortal = false

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

  let pos = { top: 0, left: 0, right: 0, bottom: 0 }
  let container: HTMLDivElement

  const setPos = () => {
    const rect = container.getBoundingClientRect()
    pos = {
      top: rect.top + container.clientHeight,
      bottom: rect.top,
      left: rect.left,
      right: rect.left + container.clientWidth,
    }
  }

  $: {
    if (container) {
      setTimeout(() => {
        setPos()
      }, 1000)
    }
  }

  let exclude: HTMLElement

  $: !hoverState && (shouldLeave = false)
  $: isDropped = ((!noHover && hoverState) || clickState) && !shouldLeave && canExpand
</script>

<div
  bind:this={container}
  use:resize_observer={{ noop: !usePortal }}
  on:resize={setPos}
  class="relative flex items-center {className.container ?? ''}">
  <HoverState bind:hoverState>
    <ClickState bind:clickState bind:dismiss={dismissClick} {exclude}>
      <slot {dismiss} {isDropped} />
      <svelte:fragment slot="exclude">
        {#if isDropped}
          <div
            bind:this={exclude}
            use:portal={{ noop: !usePortal }}
            in:slide={noSlide ? { easing: () => 1 } : {}}
            out:slide={noSlide ? { easing: () => 0 } : {}}
            style={usePortal
              ? cn(
                  upward ? `bottom: ${pos.bottom}px` : `top: ${pos.top}px`,
                  ';',
                  dir === 'ltr' ? `left: ${pos.left}px` : `right: ${pos.right}px`,
                  ';',
                )
              : ''}
            class={cn(
              usePortal ? 'fixed z-[99]' : 'absolute z-30',
              upward ? '-translate-y-3' : 'translate-y-3',
              !usePortal &&
                cn(upward ? 'bottom-full' : 'top-full', dir === 'ltr' ? 'left-0' : 'right-0'),
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
