<script lang="ts">
  import _ from 'lodash'
  import CardTable from './table/CardTable.svelte'
  import { __$ } from './locales'
  import { preSaleSignersVestings$ } from './observables/pre-sale/signers-vestings'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import PresaleVestingTableActionButton from './PresaleVestingTableActionButton.svelte'
  import ShortenedHash from './ShortenedHash.svelte'
  import TableCell from './table/TableCell.svelte'
  import TableRow from './TableRow.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
</script>

<CardTable
  headers={_.values($__$?.presale.vestings.headers)}
  mainHeaders={[0, 1, 2]}
  isLoading={$preSaleSignersVestings$ === undefined && $signerAddress$ !== undefined}
  isEmpty={!$preSaleSignersVestings$?.length}>
  {#each $preSaleSignersVestings$ ?? [] as data}
    <TableRow>
      <TableCell>
        <ShortenedHash hash={data.txId} />
      </TableCell>
      <TableCell>
        <WithCurrencyIcon>
          {formatCurrencyWithUnit(data.amount, 3)}
        </WithCurrencyIcon>
      </TableCell>
      <TableCell>
        {'$' + formatCurrencyWithUnit(data.price, 2)}
      </TableCell>
      <TableCell>
        {formatCurrencyWithUnit(data.release, 3)}
      </TableCell>
      <TableCell>
        {data.started.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell>
        {data.cliff.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell>
        {data.end.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell>
        <PresaleVestingTableActionButton {data} />
      </TableCell>
    </TableRow>
  {/each}
</CardTable>
