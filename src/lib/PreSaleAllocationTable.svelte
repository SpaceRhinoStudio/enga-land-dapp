<script lang="ts">
  import _ from 'lodash'
  import CardTable from './table/CardTable.svelte'
  import { __$ } from './locales'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import TableCell from './table/TableCell.svelte'
  import TableRow from './table/TableRow.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'

  const allocations: [number, number | null][] = [
    [100_000, 15_000],
    [2_000_000, 300_000],
    [1_000_000, null],
    [1_900_000, null],
    [5_000_000, null],
  ]
</script>

<CardTable
  headers={_.values($__$?.presale.allocations.headers)}
  className={{ container: 'text-xs md:text-sm' }}>
  {#each allocations as x, i}
    <TableRow>
      <TableCell>{_.values($__$?.presale.allocations)[i + 1]}</TableCell>
      <TableCell>
        <WithCurrencyIcon>
          {formatCurrencyWithUnit(x[0])}
        </WithCurrencyIcon>
      </TableCell>
      <TableCell>{x[1] !== null ? '$' + formatCurrencyWithUnit(x[1] / x[0]) : ''}</TableCell>
    </TableRow>
  {/each}
</CardTable>
