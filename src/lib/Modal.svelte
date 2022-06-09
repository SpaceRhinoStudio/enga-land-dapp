<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { changePortalVisibility, portal, portalMap } from './actions/portal'
  import cn from 'classnames'
  import { useWobble } from './helpers/wobble-svelte'

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

  const [shouldBlur, setShouldBlur] = useWobble({})
  $: node && setShouldBlur($portalMap.some(x => (x.index ?? -1) > (index ?? -1)) ? 1 : 0)

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
        overflow-hidden
        #sm:overflow-y-auto
        overscroll-none
        ${className.bg}
      `}
      on:click|self={dismiss}>
      {#if isOpen}
        <div
          transition:fly={{ ...(animateWidth ? { x: -500 } : { y: 500 }), duration: 500 }}
          class={cn(!neverFullWidth && 'w-full sm:w-max')}>
          <slot {isOpen} />
        </div>
      {/if}
    </div>
  {/if}
</div>
