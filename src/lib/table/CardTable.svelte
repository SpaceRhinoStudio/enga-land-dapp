<script context="module" lang="ts">
  export const table = Symbol()
  export type TableContext = {
    headers: string[]
    mainHeaders: number[] | undefined
    registerCell: (rowId: symbol, id: symbol) => number
    unRegisterCell: (rowId: symbol, id: symbol) => void
    isCollapsed: Readable<boolean>
    shouldSlide: Readable<boolean>
  }
</script>

<script lang="ts">
  import Card from '$lib/Card.svelte'
  import _ from 'lodash'
  import { onMount, setContext, tick } from 'svelte'
  import { writable, type Readable } from 'svelte/store'
  import { fade } from 'svelte/transition'
  import { screen$ } from '../helpers/media-queries'
  import LoadingSpinner from '../LoadingSpinner.svelte'
  import { __$ } from '../locales'
  import TableSeparator from './TableSeparator.svelte'

  export let className: {
    [key in 'container' | 'wrapper' | 'tableWrapper' | 'containerDimesions']?: string
  } = {}
  export let headers: string[]
  export let mainHeaders: number[] | undefined = undefined
  export let isLoading = false
  export let isEmpty = false

  const cells = writable<{ [row: symbol]: symbol[] }>({})
  const isCollapsed = writable<boolean>(true)
  $: isCollapsed.set($screen$.isMobile)

  const shouldSlide = writable(false)
  onMount(() => tick().then(() => shouldSlide.set(true)))
  setContext<TableContext>(table, {
    headers,
    mainHeaders,
    registerCell: (rowId, id) => {
      let index = 0
      cells.update(prev => {
        const row = prev[rowId] ?? []
        index = row.push(id) - 1
        return { ...prev, [rowId]: row }
      })
      return index
    },
    unRegisterCell: (rowId, id) => {
      cells.update(prev => {
        const row = prev[rowId]!
        return { ...prev, [rowId]: row.filter(x => x !== id) }
      })
    },
    isCollapsed,
    shouldSlide,
  })
</script>

<Card
  className={{
    container: className.container ?? '',
    wrapper: className.wrapper ?? '',
  }}>
  <div
    class="table min-h-[theme('spacing.32')] {className.containerDimesions ??
      'w-[calc(100%+(theme(spacing.2)*2))] -mx-2 -my-2.5'} {className.tableWrapper ?? ''}">
    <div class="table-row h-0">
      {#each $isCollapsed ? headers.filter((_, index) => mainHeaders?.includes(index) ?? true) : headers as header}
        <div class="table-cell align-middle text-text-secondary py-2 px-3.5">{header}</div>
      {/each}
    </div>
    <TableSeparator />
    <div class="table-row">
      <td colSpan={9999} class="relative overflow-hidden">
        {#if !isLoading && (!$$slots.default || isEmpty)}
          <div transition:fade class="absolute inset-0 flex items-center justify-center">
            {$__$?.main.noItem}
          </div>
        {/if}
        {#if isLoading}
          <div transition:fade class="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        {/if}
      </td>
    </div>
    {#if !isLoading}
      <slot />
    {/if}
  </div>
</Card>