<script lang="ts">
  import cn from 'classnames'
  import { fade } from 'svelte/transition'
  export let className: { [key in 'class' | 'position']?: string } = {}
  export let style = ''
</script>

<span
  transition:fade
  {style}
  class={cn(
    'h-7',
    'w-max',
    'flex items-center',
    'absolute',
    'text-black',
    'text-center',
    className.position ?? cn('top-0', 'left-1/2'),
    '-translate-y-[calc(100%+8px+theme(spacing[1.5]))]',
    '-translate-x-1/2',
    'px-4',
    'py-1',
    'bg-yellow-400',
    'rounded-full',
    'after:absolute',
    'after:w-0',
    'after:h-0',
    'after:border-transparent',
    'after:border-t-yellow-400',
    'after:top-full',
    'after:border-8',
    'after:left-[calc(50%-8px)]',
    'after:-translate-y-0.5',
    className.class,
  )}>
  <slot />
</span>
