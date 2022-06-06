<script context="module" lang="ts">
  export const row = Symbol()
  export type RowContext = {
    rowId: symbol
    isRenderingCollapsedMode: boolean
  }
</script>

<script lang="ts">
  import { getContext, setContext } from 'svelte'
  import { table, type TableContext } from './CardTable.svelte'
  import TableRowCollapsed from './TableRowCollapsed.svelte'
  import ArrowDown from '../../assets/icons/arrow-down.svg'
  import SvgIcon from '../SVGIcon.svelte'
  import { slide } from 'svelte/transition'

  const isCollapsed = getContext<TableContext>(table)?.isCollapsed
  const mainHeaders = getContext<TableContext>(table)?.mainHeaders
  const shouldSlide = getContext<TableContext>(table)?.shouldSlide

  const rowId = Symbol()
  setContext<RowContext>(row, {
    rowId,
    isRenderingCollapsedMode: false,
  })

  let isOpen = false
</script>

<div class="table-row" on:click={() => $isCollapsed && mainHeaders?.length && (isOpen = !isOpen)}>
  <slot />
  {#if $isCollapsed && mainHeaders?.length}
    <div
      transition:slide={!$shouldSlide ? { duration: 0 } : {}}
      class="table-cell align-middle pr-2 py-2.5">
      <div transition:slide={!$shouldSlide ? { duration: 0 } : {}}>
        <SvgIcon
          Icon={ArrowDown}
          width="1rem"
          height="1rem"
          className="transition-all duration-500 {isOpen && 'rotate-180'}" />
      </div>
    </div>
  {/if}
</div>
{#if $isCollapsed}
  <TableRowCollapsed {isOpen}>
    <slot />
  </TableRowCollapsed>
{/if}
