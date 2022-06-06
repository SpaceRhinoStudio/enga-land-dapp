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
</script>

<div class="relative flex items-center {className.container ?? ''}">
  <HoverState let:hoverState>
    <ClickState let:clickState let:dismiss>
      <slot {dismiss} isDropped={(hoverState || clickState) && canExpand} />
      {#if (hoverState || clickState) && canExpand}
        <div
          transition:slide
          class={cn(
            'absolute',
            upward ? 'bottom-full -translate-y-3' : 'top-full translate-y-3',
            dir === 'ltr' ? 'left-0' : 'right-0',
            className.dropContainer,
            'shadow-xl shadow-[#0008] bg-primary-900 rounded-xl',
          )}>
          <slot name="drop" {dismiss} />
        </div>
      {/if}
    </ClickState>
  </HoverState>
</div>
