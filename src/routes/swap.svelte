<script lang="ts">
  import Card from '$lib/Card.svelte'
  import LoadingSpinner from '$lib/shared/LoadingSpinner.svelte'
  import { __$ } from '$lib/shared/locales'
  import PageTitle from '$lib/PageTitle.svelte'
  import PreSaleAllocationTable from '$lib/PreSaleAllocationTable.svelte'
  import PresaleVestingTable from '$lib/PresaleVestingTable.svelte'
  import ProgressBar from '$lib/ProgressBar.svelte'
  import Select from '$lib/Select.svelte'
  import SwapCard from '$lib/SwapCard.svelte'
  import _ from 'lodash'
  import { map, switchMap, BehaviorSubject, filter } from 'rxjs'
  import { fade } from 'svelte/transition'
  import { switchSome } from '$lib/operators/pass-undefined'
  import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
  import Button from '$lib/shared/Button.svelte'
  import {
    allSales,
    allUserVestings$,
    availableSales$,
    isLoadingSalesInfo$,
    allSalesNotFunding$,
  } from '$lib/observables/enga/all-sales'
  import { signerAddress$ } from '$lib/observables/selected-web3-provider'

  let selectedSale: string | undefined
  const selectedSale$ = new BehaviorSubject(selectedSale)
  $: selectedSale$.next(selectedSale)

  const sale$ = selectedSale$.pipe(map(id => allSales.find(sale => sale.id === id)))

  const goal$ = sale$.pipe(switchSome(switchMap(sale => sale.goal$)))
  const raised$ = sale$.pipe(switchSome(switchMap(sale => sale.raised$)))

  $: isLoadingRaised = _.isUndefined(selectedSale)
    ? true
    : _.isUndefined($raised$) || _.isUndefined($goal$)

  $: $availableSales$.length > 0 &&
    _.isUndefined(selectedSale) &&
    (selectedSale = $availableSales$[0]?.sale.id)

  let showVestings = false
</script>

<PageTitle hide />
<div class="flex flex-col items-center relative z-0 #min-h-[80vh] md:min-h-0 grow">
  {#if $isLoadingSalesInfo$}
    <div transition:fade class="absolute z-0 inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  {:else if ($allSalesNotFunding$ || $availableSales$.length === 0) && !showVestings}
    <div transition:fade class="absolute z-0 inset-0 flex items-center justify-center">
      <div class="flex flex-col gap-6 items-center justify-center">
        <span>{$__$?.presale.stillPending}</span>
        <Button
          job={() => (showVestings = true)}
          className="w-64 min-h-[theme(spacing.8)]"
          disabled={!$allUserVestings$?.length}
          isLoading={$allUserVestings$ === undefined}
          secondary>
          {#if $allUserVestings$?.length}
            View Open Vestings
          {:else if $signerAddress$?.length}
            You don't have any Open Vestings
          {:else}
            {$__$.web3Provider.connect.connectButton.notConnected}
          {/if}
        </Button>
      </div>
    </div>
  {:else if showVestings}
    <div transition:fade class="flex grow items-center justify-center max-w-4xl w-full">
      <PresaleVestingTable />
    </div>
  {:else}
    <div
      transition:fade
      class="flex flex-col gap-6 items-stretch w-full max-w-[min(calc(theme(screens.md)+theme(spacing.20)))]">
      <div class="w-full flex items-center justify-between leading-none sm:px-6 md:px-0">
        <PageTitle />
        <Select
          disabled={$availableSales$.length < 2}
          bind:value={selectedSale}
          isLoading={$isLoadingSalesInfo$}>
          {#each $availableSales$ as { sale }}
            <option value={sale.id}>{sale.name}</option>
          {/each}
        </Select>
      </div>
      <div
        class="flex flex-col items-center md:items-stretch md:flex-row-reverse justify-between md:gap-7 gap-6 children:w-full md:children:max-w-[50%] sm:children:max-w-full">
        {#if $sale$}
          <SwapCard sale$={sale$.pipe(filter(noNil))} />
        {/if}
        <div class="flex flex-col gap-6 justify-between md:w-96">
          <PreSaleAllocationTable />
          <div class="flex flex-col justify-center grow">
            <Card className={{ container: '!overflow-visible mt-5 md:mt-0' }}>
              <ProgressBar
                isLoading={isLoadingRaised}
                disabled={[$goal$, $raised$].some(_.isNull)}
                percent={(($raised$ ?? 0) / ($goal$ ?? 1)) * 100}>
                <span slot="min">0</span>
                <span slot="tooltip">
                  ${Number($raised$?.toFixed(0)).toLocaleString()}
                </span>
                <span slot="max">${$goal$?.toLocaleString()}</span>
                <span slot="disabled">{$__$?.presale.notFunding}</span>
              </ProgressBar>
            </Card>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <span>{$__$?.presale.vestings.title}</span>
        {#if $sale$}
          <PresaleVestingTable />
        {/if}
      </div>
    </div>
  {/if}
</div>
