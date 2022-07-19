<script lang="ts">
  import cn from 'classnames'
  import { resize_observer } from './shared/actions/resize-observer'

  export let autoWidth = false
  export let className: { [key in 'inner' | 'ratio' | 'container']?: string } = {}
  export let ratio: number
  let height = 0
</script>

<div
  class={cn('relative', autoWidth ? 'w-[max-content]' : 'h-[max-content]', className?.container)}>
  <div
    class={cn(autoWidth ? 'h-full' : 'w-full', className?.ratio)}
    style={autoWidth ? `padding-left: ${ratio * height}px;` : `padding-top: ${100 / ratio}%;`}
    use:resize_observer
    on:resize={e => (height = e.detail.height)} />
  <div class={cn('absolute', 'inset-0', className?.inner)}>
    <slot />
  </div>
</div>
