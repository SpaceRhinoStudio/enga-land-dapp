<script lang="ts">
  import _ from 'lodash'
  import CardTable from './table/CardTable.svelte'
  import { __$ } from './shared/locales'
  import { signerAddress$ } from './observables/selected-web3-provider'
  import { formatCurrencyWithUnit } from './operators/currency-formatter'
  import PresaleVestingTableActionButton from './PresaleVestingTableActionButton.svelte'
  import ShortenedHash from './ShortenedHash.svelte'
  import TableCell from './table/TableCell.svelte'
  import TableRow from './table/TableRow.svelte'
  import WithCurrencyIcon from './WithCurrencyIcon.svelte'
  import { allUserVestings$ } from './observables/enga/all-sales'
</script>

<CardTable
  className={{ container: 'w-full max-w-full' }}
  headers={_.values($__$?.presale.vestings.headers)}
  mainHeaders={[0, 1, 2]}
  isLoading={_.isUndefined($allUserVestings$) && !_.isUndefined($signerAddress$)}
  isEmpty={!$allUserVestings$?.length}
  emptyMessage={_.isNull($allUserVestings$) ? $__$.main.genericErrorMessage : $__$?.main.noItem}>
  {#each $allUserVestings$ ?? [] as vesting (vesting.vestId)}
    <TableRow>
      <TableCell>
        <ShortenedHash hash={vesting.vestId} />
      </TableCell>
      <TableCell>
        <WithCurrencyIcon data={vesting.amount} />
      </TableCell>
      <TableCell>
        {'$' + formatCurrencyWithUnit(vesting.price, 2)}
      </TableCell>
      <TableCell>
        <WithCurrencyIcon data={vesting.released} />
      </TableCell>
      <TableCell>
        <span
          class="md:text-xs"
          title={vesting.started.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}>
          {vesting.started.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </TableCell>
      <TableCell>
        <span
          class="md:text-xs"
          title={vesting.cliff.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}>
          {vesting.cliff.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </TableCell>
      <TableCell>
        <span
          class="md:text-xs"
          title={vesting.end.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}>
          {vesting.end.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </TableCell>
      <TableCell>
        <PresaleVestingTableActionButton meta={vesting} />
      </TableCell>
    </TableRow>
  {/each}
</CardTable>
