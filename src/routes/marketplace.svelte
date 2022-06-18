<script lang="ts">
  import Button from '$lib/shared/Button.svelte'
  import { fade, fly } from 'svelte/transition'
  import Card from '$lib/Card.svelte'
  import LoadingSpinner from '$lib/shared/LoadingSpinner.svelte'
  import { __$ } from '$lib/shared/locales'
  import MarketplaceCollectionSelectorDesktop from '$lib/MarketplaceCollectionSelectorDesktop.svelte'
  import MarketplaceCollectionSelectorMobile from '$lib/MarketplaceCollectionSelectorMobile.svelte'
  import {
    marketplaceFilterOptions,
    MarketplaceFilterType,
    marketplaceItems$Factory,
    MarketplaceItemsType,
    marketplaceSortOptions,
  } from '$lib/observables/enga/marketplace-items'
  import { controlStreamPayload } from '$lib/shared/operators/control-stream-payload'
  import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
  import { passNil } from '$lib/operators/pass-undefined'
  import { signerBalanceOf } from '$lib/operators/web3/balance-of'
  import PageTitle from '$lib/PageTitle.svelte'
  import Select from '$lib/Select.svelte'
  import { map } from 'rxjs'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import ShowcaseCard from '$lib/showcase-card/ShowcaseCard.svelte'
  import _, { isNil } from 'lodash'
  import { Routes } from '$lib/shared/configs/routes'
  import { keysOf } from '$lib/shared/utils/type-safe'
  import { tick } from 'svelte'
  import WithLoading from '$lib/shared/WithLoading.svelte'

  const engaBalance$ = EngaTokenContract$.pipe(
    signerBalanceOf,
    passNil(map(x => formatCurrencyWithUnit(x))),
  )

  let collection: MarketplaceItemsType = Routes.mpOpifexOff

  function getSortOptions(collection: MarketplaceItemsType) {
    return marketplaceSortOptions[collection]
  }

  $: sortOptions = getSortOptions(collection)
  $: filterOptions = marketplaceFilterOptions[collection]
  let sort: typeof sortOptions[number] | undefined
  let filter: MarketplaceFilterType | undefined

  let collectionChanged = false
  $: {
    collection
    collectionChanged = true
    tick().then(() => {
      collectionChanged = false
    })
  }

  $: {
    collection
    tick().then(() => {
      sort = getSortOptions(collection)[0]
      filter = undefined
    })
  }

  $: [itemsController$, items$] = marketplaceItems$Factory(collection, filter, sort)
  const pageSize = 10

  $: itemsController$.next({ Load: { limit: pageSize } })
  $: isLoading$ = itemsController$.pipe(controlStreamPayload('isLoading'))
</script>

<div class="flex flex-col items-center w-full">
  <div class="flex flex-col gap-6 w-full md:w-auto">
    <PageTitle />
    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="flex flex-col max-w-md md:max-w-none self-center md:self-auto md:w-auto w-full">
        <MarketplaceCollectionSelectorDesktop bind:collection />
        <MarketplaceCollectionSelectorMobile bind:collection />
      </div>
      <div
        class="children:max-w-md md:children:max-w-none md:children:w-full children:w-full w-full md:w-[42rem] flex flex-col items-center gap-4 relative z-0 min-h-[theme(spacing.96)]">
        <Card
          className={{
            container:
              'md:sticky top-[calc(theme(spacing.24)+theme(spacing.4))] md:top-[calc(theme(spacing.28)+theme(spacing.4))] z-20',
            wrapper: 'flex flex-col gap-1 md:flex-row justify-between',
          }}>
          <WithLoading data={$engaBalance$} className={{ wrapper: 'flex gap-3' }}>
            <svelte:fragment slot="data">
              {#if !_.isNil($engaBalance$)}
                <span class="text-text-secondary">{'ENGA'}</span>
                <span>{$engaBalance$}</span>
              {:else}
                <span>{$__$.web3Provider.connect.connectButton.notConnected}</span>
              {/if}
            </svelte:fragment>
          </WithLoading>
          <div class="flex flex-col md:flex-row md:gap-3 gap-1">
            <div class="flex h-11 md:h-auto items-center">
              <span class="text-text-secondary">
                {$__$?.marketplace.sort}
              </span>
              <Select
                isLoading={collectionChanged}
                bind:value={sort}
                className={{ container: '!bg-transparent !py-0 -mr-1' }}>
                {#each getSortOptions(collection) as x}
                  <option value={x}>
                    {$__$?.marketplace.sortTitles[x]}
                  </option>
                {/each}
              </Select>
            </div>
            {#each keysOf(filterOptions) as key}
              <div class="hidden md:flex border-r border-r-primary-600 h-full" />
              <div class="flex">
                <span class="text-text-secondary">
                  {$__$?.marketplace.filterTitles[key]}
                </span>
                <Select
                  isLoading={collectionChanged}
                  on:change={e => (filter = { ...(filter ?? {}), [key]: e.detail })}
                  className={{ container: '!bg-transparent !py-0 -mr-1' }}>
                  {#each filterOptions[key] as x}
                    <option value={x}>
                      {x ?? $__$?.marketplace.filterTitles.all}
                    </option>
                  {/each}
                </Select>
              </div>
            {/each}
          </div>
        </Card>
        {#if $items$ === undefined}
          <div
            transition:fade
            class="top-20 h-96 w-full flex justify-center items-center absolute z-0">
            <LoadingSpinner />
          </div>
        {/if}
        {#if $items$ !== undefined}
          <div
            in:fly={{
              y: -200,
              duration: 300,
            }}
            class="!mb-28 relative z-10 flex flex-col md:px-5">
            {#each $items$ ?? [] as meta, i (meta.id)}
              <div
                in:fly={{
                  y: -200,
                  delay: i % pageSize < 4 ? (i % pageSize) * 200 : 0,
                  duration: i % pageSize < 4 ? 500 : 0,
                }}
                class="pt-4 pb-2">
                <ShowcaseCard type={collection} {meta} forSale />
              </div>
            {/each}
          </div>
        {/if}
        {#if $items$ !== undefined}
          <div transition:fade class="absolute bottom-0 w-full flex justify-center">
            <Button
              job={() => itemsController$.next({ Load: { limit: pageSize } })}
              isLoading={$isLoading$ ?? true}
              className="h-10 !px-20 mb-5">
              {$__$?.main.loadMore}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
