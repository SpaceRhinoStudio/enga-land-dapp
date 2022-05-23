<script lang="ts">
  import { getContext, onDestroy } from 'svelte'
  import { table, type TableContext } from './CardTable.svelte'
  import { row, type RowContext } from './TableRow.svelte'

  const rowId = getContext<RowContext>(row)?.rowId
  const isRenderingCollapsedMode = getContext<RowContext>(row)?.isRenderingCollapsedMode
  const isCollapsed = getContext<TableContext>(table)?.isCollapsed
  const register = getContext<TableContext>(table)?.registerCell
  const unRegister = getContext<TableContext>(table)?.unRegisterCell
  const headers = getContext<TableContext>(table)?.headers
  const mainHeaders = getContext<TableContext>(table)?.mainHeaders

  const id = Symbol()
  const index = register?.(rowId, id)
  onDestroy(() => {
    unRegister?.(rowId, id)
  })
</script>

{#if mainHeaders !== undefined && !mainHeaders.includes(index) && $isCollapsed && isRenderingCollapsedMode}
  <div class="table-row" data-index={index}>
    <div class="table-cell align-middle text-text-secondary py-2.5 px-3.5">{headers[index]}</div>
    <div class="table-cell align-middle py-2.5 px-3.5">
      <slot />
    </div>
  </div>
{:else if (mainHeaders !== undefined && $isCollapsed && mainHeaders.includes(index) && !isRenderingCollapsedMode) || !$isCollapsed || mainHeaders === undefined}
  <div class="table-cell align-middle py-2.5 px-3.5" data-index={index}>
    <slot />
  </div>
{/if}
