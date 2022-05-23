<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { spring } from 'svelte/motion'
  import { fade } from 'svelte/transition'
  import { changePortalVisibility, portal, portalMap } from './actions/portal'
  import Fade from './Fade.svelte'

  export let isOpen = false
  export let acceptExit = true
  export const toggle = () => {
    isOpen = !isOpen
  }
  export let animateWidth = false
  export let className: { [key in 'bg']?: string } = {}
  export let neverFullWidth = false

  const dispatch = createEventDispatcher<{ requestExit: true }>()
  function dismiss() {
    dispatch('requestExit', true)
    if (acceptExit) {
      isOpen = false
    }
  }

  let node: HTMLElement
  let index: number | null = null

  let shouldBlur = spring(0, { precision: 0.1 })
  $: node && shouldBlur.set($portalMap.some(x => (x.index ?? -1) > (index ?? -1)) ? 1 : 0)

  $: index = changePortalVisibility(node, isOpen)
</script>

<div use:portal bind:this={node}>
  {#if isOpen}
    <div
      transition:fade
      tabindex="0"
      on:keydown={e => e.key === 'Escape' && dismiss()}
      style="z-index: {(index ?? -100) + 50}; {$shouldBlur === 0
        ? ''
        : `filter: blur(${$shouldBlur * 20}px); `}"
      class={`
        fixed inset-0
        bg-black bg-opacity-40
        flex flex-col items-center justify-end sm:justify-center
        overflow-y-auto
        overscroll-none
        ${className.bg}
      `}
      on:click|self={dismiss}>
      <Fade
        mode={animateWidth ? 'width' : 'height'}
        visible={isOpen}
        className={neverFullWidth
          ? {}
          : { container: 'w-full sm:w-max', wrapper: 'w-full sm:w-max' }}>
        <slot {isOpen} />
      </Fade>
    </div>
  {/if}
</div>
