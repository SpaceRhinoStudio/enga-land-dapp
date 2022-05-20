<script lang="ts">
  import ClickState from './ClickState.svelte'
  import Fade from './Fade.svelte'
  import HoverState from './HoverState.svelte'

  export let upward: boolean = false
  export let className: { [key in 'container' | 'dropContainer' | 'dropWrapper']?: string } = {}
  export let canExpand = true
</script>

<div class="relative flex items-center {className.container ?? ''}">
  <HoverState let:hoverState>
    <ClickState let:clickState let:dismiss>
      <slot {dismiss} isDropped={(hoverState || clickState) && canExpand} />
      <Fade
        mode="height"
        visible={(hoverState || clickState) && canExpand}
        className={{
          container: `absolute ${upward ? 'bottom-full' : 'top-full'} left-0 ${
            upward ? 'mb-3' : 'mt-3'
          } ${className.dropContainer ?? ''} shadow-xl shadow-[#0008] bg-primary-900 rounded-xl`,
          wrapper: className.dropWrapper ?? '',
        }}
        slot="exclude">
        <slot name="drop" {dismiss} />
      </Fade>
    </ClickState>
  </HoverState>
</div>
