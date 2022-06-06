<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import { table, type TableContext } from './CardTable.svelte'
  import { row, type RowContext } from './TableRow.svelte'

  const rowId = getContext<RowContext>(row)?.rowId
  const isRenderingCollapsedMode = getContext<RowContext>(row)?.isRenderingCollapsedMode
  const isCollapsed = getContext<TableContext>(table)?.isCollapsed
  const register = getContext<TableContext>(table)?.registerCell
  const unRegister = getContext<TableContext>(table)?.unRegisterCell
  const headers = getContext<TableContext>(table)?.headers
  const mainHeaders = getContext<TableContext>(table)?.mainHeaders
  const shouldSlide = getContext<TableContext>(table)?.shouldSlide

  const id = Symbol()
  const index = register?.(rowId, id)
  onDestroy(() => {
    unRegister?.(rowId, id)
  })

  export let colSpan = 1
</script>

{#if mainHeaders !== undefined && !mainHeaders.includes(index) && $isCollapsed && isRenderingCollapsedMode}
  <div class="table-row" data-index={index}>
    <div class="table-cell align-middle text-text-secondary py-2.5 px-3.5">{headers[index]}</div>
    <div class="table-cell align-middle py-2.5 px-3.5">
      <slot />
    </div>
  </div>
{:else if (mainHeaders !== undefined && $isCollapsed && mainHeaders.includes(index) && !isRenderingCollapsedMode) || !$isCollapsed || mainHeaders === undefined}
  <td
    transition:slide={!$shouldSlide ? { easing: () => 1 } : {}}
    colspan={colSpan}
    class="align-middle py-2.5 px-3.5"
    data-index={index}>
    <div transition:slide={!$shouldSlide ? { easing: () => 1 } : {}}>
      <slot />
    </div>
  </td>
{/if}
