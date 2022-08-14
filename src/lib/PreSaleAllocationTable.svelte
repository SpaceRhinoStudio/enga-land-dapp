<script lang="ts">
  import _ from 'lodash'
  import CardTable from './table/CardTable.svelte'
  import { __$ } from './shared/locales'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import TableCell from './table/TableCell.svelte'
  import TableRow from './table/TableRow.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import cn from 'classnames'

  const allocations: [number, number | null][] = [
    [300_000, 36_000], //earlyInvestors
    [2_000_000, 300_000], //preSale
    [170_000, null], //marketing
    [1_000_000, null], //dao
    [1_530_000, null], //stakeHolders
    [3_000_000, null], //vc
    [8_000_000, null], //initialSupply
  ]
</script>

<CardTable
  headers={_.values($__$?.presale.allocations.headers)}
  className={{
    container: 'text-xs md:text-sm',
  }}>
  {#each allocations as x, i}
    <TableRow>
      <TableCell class={{ cell: '!py-1.5' }}
        >{_.values($__$?.presale.allocations)[i + 1]}</TableCell>
      <TableCell class={{ cell: '!py-1.5' }} colSpan={x[1] === null ? 2 : 1}>
        <div class="w-full relative z-0">
          {#if x[1] === null}
            <div class="absolute z-0 border-b border-primary-600 left-0 right-0 top-1/2" />
          {/if}
          <WithCurrencyIcon
            className={{
              container: cn(
                x[1] === null && 'relative z-10 w-min mx-auto #ml-[30%] px-3 bg-primary-800',
              ),
            }}
            data={x[0]} />
        </div>
      </TableCell>
      {#if x[1] !== null}
        <TableCell class={{ cell: '!py-1.5' }}
          >{'$' + formatCurrencyWithUnit(x[1] / x[0])}</TableCell>
      {/if}
    </TableRow>
  {/each}
</CardTable>
