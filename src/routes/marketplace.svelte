<script lang="ts">
  import Button from '$lib/Button.svelte'
  import { fade, fly } from 'svelte/transition'
  import Card from '$lib/Card.svelte'
  import LoadingSpinner from '$lib/shared/LoadingSpinner.svelte'
  import { __$ } from '$lib/shared/locales'
  import MarketplaceCollectionSelectorDesktop from '$lib/MarketplaceCollectionSelectorDesktop.svelte'
  import MarketplaceCollectionSelectorMobile from '$lib/MarketplaceCollectionSelectorMobile.svelte'
  import { endroMarketplaceItems$Factory } from '$lib/observables/enga/marketplace-items'
  import { controlStreamPayload } from '$lib/operators/control-stream-payload'
  import { formatCurrencyWithUnit } from '$lib/operators/currency-formatter'
  import { passNil } from '$lib/operators/pass-undefined'
  import { signerBalanceOf } from '$lib/operators/web3/balance-of'
  import PageTitle from '$lib/PageTitle.svelte'
  import Select from '$lib/Select.svelte'
  import { genArr } from '$lib/shared/utils/random'
  import { map } from 'rxjs'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import { EndroSortOptions, MarketplaceSortOptions } from '$lib/shared/types/marketplace'
  import ShowcaseCard from '$lib/ShowcaseCard.svelte'
  import _ from 'lodash'

  const engaBalance$ = EngaTokenContract$.pipe(
    signerBalanceOf,
    passNil(map(x => formatCurrencyWithUnit(x))),
  )
  const sortOptions = [..._.values(MarketplaceSortOptions), ..._.values(EndroSortOptions)]
  const genOptions = [undefined, ...genArr(15, e => `${e + 1}`)]
  let sort: typeof sortOptions[number]
  let gen: typeof genOptions[number]

  $: [itemsController$, items$] = endroMarketplaceItems$Factory(
    { gen: _.isUndefined(gen) ? gen : Number(gen) },
    sort,
  )
  const pageSize = 10

  $: itemsController$.next({ Load: { limit: pageSize } })
  $: isLoading$ = itemsController$.pipe(controlStreamPayload('isLoading'))
</script>

<div class="flex flex-col items-center w-full">
  <div class="flex flex-col gap-6 w-full md:w-auto">
    <PageTitle />
    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="flex flex-col">
        <MarketplaceCollectionSelectorDesktop />
        <MarketplaceCollectionSelectorMobile />
      </div>
      <div
        class="sm:children:w-[24rem] md:children:w-full children:w-full w-full md:w-[42rem] flex flex-col items-center gap-4 relative z-0 min-h-[theme(spacing.96)]">
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
        {#if $items$ === undefined}
          <div
            transition:fade
            class="top-20 h-96 w-full flex justify-center items-center absolute z-0">
            <LoadingSpinner />
          </div>
        {/if}
        <div class="!mb-28 relative z-10 flex flex-col md:px-5">
          {#each $items$ ?? [] as x, i (x.id)}
            <div transition:fly={{ y: -200, delay: (i % pageSize) * 200 }} class="pt-4 pb-2">
              <ShowcaseCard endroOptions={{ endro: x, forSale: true }} />
            </div>
          {/each}
        </div>
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
