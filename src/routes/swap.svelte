<script lang="ts">
  import Card from '$lib/Card.svelte'
  import Fade from '$lib/Fade.svelte'
  import LoadingSpinner from '$lib/LoadingSpinner.svelte'
  import { __$ } from '$lib/locales'
  import { preSaleGoal$ } from '$lib/observables/pre-sale/goal'
  import { preSaleTotalCollateralRaised$ } from '$lib/observables/pre-sale/raised'
  import { preSaleStatus$ } from '$lib/observables/pre-sale/status'
  import { PreSaleStatus } from '$lib/operators/pre-sale/status'
  import PageTitle from '$lib/PageTitle.svelte'
  import PreSaleAllocationTable from '$lib/PreSaleAllocationTable.svelte'
  import PresaleVestingTable from '$lib/PresaleVestingTable.svelte'
  import ProgressBar from '$lib/ProgressBar.svelte'
  import SwapCard from '$lib/SwapCard.svelte'
  import _ from 'lodash'
  import { fade } from 'svelte/transition'

  let isLoadingRaised = true
  $: isLoadingRaised = _.isUndefined($preSaleTotalCollateralRaised$) || _.isUndefined($preSaleGoal$)
  let notFunding = false
  $: notFunding = _.isNull($preSaleTotalCollateralRaised$) || _.isNull($preSaleGoal$)
</script>

<div class="flex flex-col items-center relative z-0 min-h-[theme(spacing.96)] grow">
  {#if $preSaleStatus$ === undefined}
    <div transition:fade class="absolute z-0 inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  {/if}
  {#if $preSaleStatus$ === PreSaleStatus.Pending || $preSaleStatus$ === null}
    <div transition:fade class="flex flex-col max-w-full grow">
      <div class="grow flex items-center justify-center">
        {$__$?.presale.stillPending}
      </div>
    </div>
  {/if}
  {#if !_.isNil($preSaleStatus$) && $preSaleStatus$ !== PreSaleStatus.Pending}
    <div transition:fade class="max-w-full">
      <div class="flex flex-col space-y-6">
        <PageTitle />
        <div
          class="flex flex-col items-stretch md:flex-row-reverse justify-center md:space-x-reverse md:space-x-7 space-y-6 md:space-y-0">
          <SwapCard />
          <div class="flex flex-col gap-6 justify-between md:w-96">
            <PreSaleAllocationTable />
            <div class="flex flex-col justify-center grow">
              <Card className={{ container: '!overflow-visible' }}>
                <ProgressBar
                  isLoading={isLoadingRaised}
                  disabled={notFunding}
                  percent={(($preSaleTotalCollateralRaised$ ?? 0) / ($preSaleGoal$ ?? 1)) * 100}>
                  <span slot="min">0</span>
                  <span slot="tooltip">
                    ${Number($preSaleTotalCollateralRaised$?.toFixed(0)).toLocaleString()}
                  </span>
                  <span slot="max">${$preSaleGoal$?.toLocaleString()}</span>
                  <span slot="disabled">{$__$?.presale.notFunding}</span>
                </ProgressBar>
              </Card>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <span>{$__$?.presale.vestings.title}</span>
          <PresaleVestingTable />
        </div>
      </div>
    </div>
  {/if}
</div>
