<script lang="ts">
  import { getContext, setContext } from 'svelte'
  import Fade from './Fade.svelte'
  import { row, type RowContext } from './TableRow.svelte'

  const rowId = Symbol()
  setContext<RowContext>(row, { rowId, isRenderingCollapsedMode: true })

  export let isOpen: boolean
</script>

<div class="table-row">
  <td colspan="9999" class="!p-0 relative">
    <div class="bg-primary-700 absolute top-0 bottom-0 -left-96 -right-96" />
    <Fade visible={isOpen} mode="height" className={{ wrapper: 'table' }}>
      <slot />
    </Fade>
  </td>
</div>
