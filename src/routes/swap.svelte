<script lang="ts">
  import Card from '$lib/Card.svelte'
  import LoadingSpinner from '$lib/LoadingSpinner.svelte'
  import { __$ } from '$lib/locales'
  import { preSaleGoal$ } from '$lib/observables/pre-sale/goal'
  import { preSaleTotalCollateralRaised$ } from '$lib/observables/pre-sale/raised'
  import { preSaleStatus$ } from '$lib/observables/pre-sale/status'
  import { seedSaleGoal$ } from '$lib/observables/seed-sale/goal'
  import { seedSaleTotalCollateralRaised$ } from '$lib/observables/seed-sale/raised'
  import { seedSaleStatus$ } from '$lib/observables/seed-sale/status'
  import { fallbackWeb3Provider$ } from '$lib/observables/web3-providers/fallback-provider'
  import { blockNumber$ } from '$lib/observables/web3/block-number'
  import { PreSaleStatus } from '$lib/operators/pre-sale/status'
  import { SeedSaleStatus } from '$lib/operators/seed-sale/status'
  import PageTitle from '$lib/PageTitle.svelte'
  import PreSaleAllocationTable from '$lib/PreSaleAllocationTable.svelte'
  import PresaleVestingTable from '$lib/PresaleVestingTable.svelte'
  import ProgressBar from '$lib/ProgressBar.svelte'
  import Select from '$lib/Select.svelte'
  import SwapCard from '$lib/SwapCard.svelte'
  import { noNil } from '$lib/utils/no-sentinel-or-undefined'
  import _, { isUndefined } from 'lodash'
  import {
    from,
    map,
    of,
    switchMap,
    filter,
    combineLatest,
    throttleTime,
    asyncScheduler,
    startWith,
  } from 'rxjs'
  import { fade } from 'svelte/transition'

  let sale: 'preSale' | 'seedSale' | undefined
  $: goal$ = sale === 'preSale' ? preSaleGoal$ : seedSaleGoal$
  $: raised$ = sale === 'preSale' ? preSaleTotalCollateralRaised$ : seedSaleTotalCollateralRaised$
  $: isLoadingRaised = _.isUndefined(sale) ? true : _.isUndefined($raised$) || _.isUndefined($goal$)
  $: notFunding = _.isUndefined(sale) ? true : _.isNull($raised$) || _.isNull($goal$)

  const isReadingStatus$ = combineLatest({ pre: preSaleStatus$, seed: seedSaleStatus$ }).pipe(
    throttleTime(500, asyncScheduler, { trailing: true }),
    map(({ pre, seed }) => [pre, seed].some(_.isUndefined)),
    startWith(true),
  )
</script>

<div class="flex flex-col items-center relative z-0 min-h-[theme(spacing.96)] grow">
  {#if $preSaleStatus$ === undefined || $seedSaleStatus$ === undefined}
    <div transition:fade class="absolute z-0 inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  {/if}
  {#if ($preSaleStatus$ === PreSaleStatus.Pending || $preSaleStatus$ === null) && ($seedSaleStatus$ === SeedSaleStatus.Pending || $seedSaleStatus$ === null)}
    <div transition:fade class="flex flex-col max-w-full grow">
      <div class="grow flex items-center justify-center">
        {$__$?.presale.stillPending}
      </div>
    </div>
  {/if}
  {#if (!_.isNil($preSaleStatus$) && $preSaleStatus$ !== PreSaleStatus.Pending) || (!_.isNil($seedSaleStatus$) && $seedSaleStatus$ !== SeedSaleStatus.Pending)}
    <div
      transition:fade
      class="flex flex-col gap-6 items-stretch w-full max-w-[min(calc(theme(screens.md)+theme(spacing.20)))]">
      <div class="w-full flex items-center justify-between leading-none sm:px-6 md:px-0">
        <PageTitle />
        <Select
          isLoading={$isReadingStatus$}
          disabled={!(
            !_.isNil($preSaleStatus$) &&
            $preSaleStatus$ !== PreSaleStatus.Pending &&
            !_.isNil($seedSaleStatus$) &&
            $seedSaleStatus$ !== SeedSaleStatus.Pending
          )}
          bind:value={sale}>
          {#if !_.isNil($preSaleStatus$) && $preSaleStatus$ !== PreSaleStatus.Pending}
            <option value="preSale">Presale</option>
          {/if}
          {#if !_.isNil($seedSaleStatus$) && $seedSaleStatus$ !== SeedSaleStatus.Pending}
            <option value="seedSale">Seed Sale</option>
          {/if}
        </Select>
      </div>
      <div
        class="flex flex-col items-center md:items-stretch md:flex-row-reverse justify-between md:gap-7 gap-6 children:w-full md:children:max-w-[50%] sm:children:max-w-full">
        {#if sale}
          <SwapCard {sale} />
        {/if}
        <div class="flex flex-col gap-6 justify-between md:w-96">
          <PreSaleAllocationTable />
          <div class="flex flex-col justify-center grow">
            <Card className={{ container: '!overflow-visible mt-5 md:mt-0' }}>
              <ProgressBar
                isLoading={isLoadingRaised}
                disabled={notFunding}
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
        {#if sale}
          <PresaleVestingTable {sale} />
        {/if}
      </div>
    </div>
  {/if}
</div>
