<script lang="ts">
  import cn from 'classnames'

  import { getContext, setContext } from 'svelte'
  import { slide } from 'svelte/transition'
  import Fade from './Fade.svelte'
  import { row, type RowContext } from './TableRow.svelte'

  const rowId = Symbol()
  setContext<RowContext>(row, { rowId, isRenderingCollapsedMode: true })

  export let isOpen: boolean
</script>

<div class={cn('table-row', isOpen && 'children:children:last:-bottom-5')}>
  <td colspan="9999" class="!p-0 relative">
    <div class="bg-primary-700 absolute top-0 bottom-0 transition-[bottom] -left-96 -right-96" />
    {#if isOpen}
      <div transition:slide>
        <div class="relative table py-3">
          <slot />
        </div>
      </div>
    {/if}
  </td>
</div>
