<script lang="ts">
  import Button from '$lib/Button.svelte'
  import { fade, scale, TransitionConfig, slide, fly } from 'svelte/transition'
  import Card from '$lib/Card.svelte'
  import Fade from '$lib/Fade.svelte'
  import LoadingSpinner from '$lib/LoadingSpinner.svelte'
  import { __$ } from '$lib/locales'
  import MarketplaceCollectionSelectorDesktop from '$lib/MarketplaceCollectionSelectorDesktop.svelte'
  import MarketplaceCollectionSelectorMobile from '$lib/MarketplaceCollectionSelectorMobile.svelte'
  import {
    endroMarketplaceItems$,
    endroMarketplaceItemsController$,
  } from '$lib/observables/enga/marketplace-items'
  import { controlStreamPayload } from '$lib/operators/control-stream-payload'
  import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
  import { passNil } from '$lib/operators/pass-undefined'
  import { signerBalanceOf } from '$lib/operators/web3/balance-of'
  import PageTitle from '$lib/PageTitle.svelte'
  import Select from '$lib/Select.svelte'
  import { genArr } from '$lib/utils/random'
  import { animationFrameScheduler, concatMap, delay, map, of, pipe } from 'rxjs'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import { MarketplaceSortOptionsArray, EndroSortOptionsArray } from '$lib/types/marketplace'
  import ShowcaseCard from '$lib/ShowcaseCard.svelte'
  import { onMount } from 'svelte'
  import { quintOut } from 'svelte/easing'

  const engaBalance$ = EngaTokenContract$.pipe(
    signerBalanceOf,
    passNil(map(x => formatCurrencyWithUnit(x))),
  )
  const sortOptions = [...MarketplaceSortOptionsArray, ...EndroSortOptionsArray]
  const genOptions = [...genArr(16, e => String(e))]
  let sort = sortOptions[0]
  let gen = genOptions[0]

  onMount(() => {
    endroMarketplaceItemsController$.next({ Load: true })
  })
  const isLoading$ = endroMarketplaceItemsController$.pipe(controlStreamPayload('isLoading'))
</script>

<div class="flex flex-col items-center w-full">
  <div class="flex flex-col gap-6 w-full md:w-auto">
    <PageTitle title={$__$?.nav.marketplace} />
    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="flex flex-col">
        <MarketplaceCollectionSelectorDesktop />
        <MarketplaceCollectionSelectorMobile />
      </div>
      <div class="md:w-screen md:max-w-screen-md flex flex-col gap-4 relative z-0">
        <Card
          className={{
            wrapper: 'flex flex-col space-y-1 md:space-y-0 md:flex-row justify-between',
          }}>
          <div class="flex space-x-3">
            <span class="text-text-secondary">{'ENGA'}</span>
            <span>{$engaBalance$ ?? 0}</span>
          </div>
          <div class="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0">
            <div class="flex h-11 md:h-auto items-center">
              <span class="text-text-secondary">
                {$__$?.marketplace.sort}
              </span>
              <Select bind:value={sort} className={{ container: '!bg-transparent !py-0' }}>
                {#each sortOptions as x}
                  <option value={x}>
                    {$__$?.marketplace.sortTitles[x]}
                  </option>
                {/each}
              </Select>
            </div>
            <div class="hidden md:flex w-px bg-primary-600 h-full" />
            <div class="flex">
              <span class="text-text-secondary">
                {$__$?.marketplace.generation}
              </span>
              <Select bind:value={gen} className={{ container: '!bg-transparent !py-0' }}>
                {#each genOptions as x}
                  <option value={x}>
                    {x ?? $__$?.marketplace.sortTitles.all}
                  </option>
                {/each}
              </Select>
            </div>
          </div>
        </Card>
        {#if $endroMarketplaceItems$ === undefined}
          <div transition:fade class="h-96 w-full flex justify-center items-center absolute z-0">
            <LoadingSpinner />
          </div>
        {/if}
        <div class="!mb-28 relative z-10">
          <div class="flex flex-col md:px-5">
            {#each $endroMarketplaceItems$ ?? [] as x (x.id)}
              <div transition:fly={{ delay: 100, duration: 300, y: 350 }} class="pt-4">
                <ShowcaseCard endroOptions={{ endro: x, forSale: true }} />
              </div>
            {/each}
          </div>
        </div>
        {#if $endroMarketplaceItems$ !== undefined}
          <div
            transition:fade={{ delay: 1000 }}
            class="absolute bottom-0 w-full flex justify-center">
            <Button
              job={() => endroMarketplaceItemsController$.next({ Load: true })}
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
