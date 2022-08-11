<script lang="ts">
  import cn from 'classnames'
  import { setContext } from 'svelte'
  import { slide } from 'svelte/transition'
  import { row, type RowContext } from './TableRow.svelte'

  const rowId = Symbol()
  setContext<RowContext>(row, { rowId, isRenderingCollapsedMode: true })

  export let isOpen: boolean
</script>

<div class={cn('table-row', isOpen && 'children:children:last:-bottom-5')}>
  <td colspan="9999" class="!p-0 relative">
    <div
      class="bg-primary-700 absolute top-1.5 bottom-1.5 transition-[bottom] -left-96 -right-96" />
    {#if isOpen}
      <div transition:slide>
        <div class="relative table py-4 w-full">
          <slot />
        </div>
      </div>
    {/if}
  </td>
</div>

<style lang="postcss">
  .table-row:last-child :global(.table) {
    padding-bottom: 0;
  }
</style>
