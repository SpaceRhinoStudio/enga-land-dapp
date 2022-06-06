<script lang="ts">
  import cn from 'classnames'

  export let className: { [key in 'inner' | 'ratio' | 'container']?: string } = {}
  export let ratio: number
</script>

<div class={cn('relative', 'h-[max-content]', className?.container)}>
  <div class={cn('w-full', className?.ratio)} style="padding-top: {100 / ratio}%;" />
  <div class={cn('absolute', 'inset-0', className?.inner)}>
    <slot />
  </div>
</div>
