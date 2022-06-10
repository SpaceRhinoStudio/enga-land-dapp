<script lang="ts">
  import Fade from './Fade.svelte'
  import LoadingOverlay from './shared/LoadingOverlay.svelte'
  import ToolTip from './ToolTip.svelte'
  import cn from 'classnames'
  import { fade } from 'svelte/transition'

  export let percent: number
  export let isLoading = false
  export let className: { [key in 'innerContainer']?: string } = {}
  export let disabled = false
</script>

<div class={cn('relative transition-all w-full', disabled && 'mt-5')}>
  <div
    class={cn(
      'flex gap-4 items-center',
      disabled ? 'opacity-0' : 'opacity-100',
      className.innerContainer,
    )}>
    {#if $$slots.min}
      <span class={cn('transition-all duration-1000', isLoading && 'opacity-0')}>
        <slot name="min" />
      </span>
    {/if}
    <div
      class={cn(
        'w-full h-5 bg-transparent relative',
        'transition-all duration-1000',
        isLoading && 'opacity-0 ',
      )}>
      <div class="w-full absolute top-1/2 -translate-y-1/2 h-0.5 bg-neutral-600 opacity-25 " />
      <div class="relative w-full h-full">
        <ToolTip className={{ class: 'font-bold transition-all' }} style="left: {percent}%;">
          {#if $$slots.tooltip}
            <slot name="tooltip" />
          {:else}
            <span>{percent}%</span>
          {/if}
        </ToolTip>
        <div class="w-full h-full rounded-full overflow-hidden">
          <div
            style="width: {percent}%"
            class={cn(
              'transition-all',
              'from-red-600',
              'bg-gradient-to-r',
              'to-yellow-400',
              'h-full',
              'text-right',
              'relative',
            )} />
        </div>
      </div>
    </div>
    {#if $$slots.max}
      <span class={cn('transition-all duration-1000', isLoading && 'opacity-0')}>
        <slot name="max" />
      </span>
    {/if}
  </div>
  <LoadingOverlay visible={isLoading} className={{ container: '!top-4' }} />
  {#if disabled}
    <div transition:fade class="absolute inset-0 flex items-center justify-center text-sm">
      <slot name="disabled" />
    </div>
  {/if}
</div>
