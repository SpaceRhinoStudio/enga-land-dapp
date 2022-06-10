<script lang="ts">
  import _ from 'lodash'
  import CardTable from './table/CardTable.svelte'
  import { __$ } from './shared/locales'
  import { preSaleSignersVestings$ } from './observables/pre-sale/signers-vestings'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import PresaleVestingTableActionButton from './PresaleVestingTableActionButton.svelte'
  import ShortenedHash from './ShortenedHash.svelte'
  import TableCell from './table/TableCell.svelte'
  import TableRow from './table/TableRow.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import { seedSaleSignersVestings$ } from './observables/seed-sale/signers-vestings'
  import { releaseAmount } from './operators/pre-sale/release-amount'

  export let sale: 'preSale' | 'seedSale'
  $: vestings$ = sale === 'preSale' ? preSaleSignersVestings$ : seedSaleSignersVestings$
</script>

<CardTable
  className={{ container: 'w-full max-w-full' }}
  headers={_.values($__$?.presale.vestings.headers)}
  mainHeaders={[0, 1, 2]}
  isLoading={$vestings$ === undefined && $signerAddress$ !== undefined}
  isEmpty={!$vestings$?.length}>
  {#each $vestings$ ?? [] as data}
    <TableRow>
      <TableCell>
        <ShortenedHash hash={data.txId} />
      </TableCell>
      <TableCell>
        <WithCurrencyIcon data={data.amount} />
      </TableCell>
      <TableCell>
        {'$' + formatCurrencyWithUnit(data.price, 2)}
      </TableCell>
      <TableCell>
        <WithCurrencyIcon data={data.released} />
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
        <PresaleVestingTableActionButton {sale} {data} />
      </TableCell>
    </TableRow>
  {/each}
</CardTable>
