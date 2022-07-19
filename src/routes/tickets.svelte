<script lang="ts">
  import { goto } from '$app/navigation'

  import Card from '$lib/Card.svelte'
  import { engaBalance$ } from '$lib/observables/enga/enga-balance'
  import { solBalance$ } from '$lib/observables/enga/sol-balance'
  import { signerAddress$ } from '$lib/observables/selected-web3-provider'
  import Button from '$lib/shared/Button.svelte'

  import { config } from '$lib/shared/configs'
  import { routeConfig, Routes } from '$lib/shared/configs/routes'
  import { isSafari$ } from '$lib/shared/contexts/is-firefox'
  import { __$ } from '$lib/shared/locales'
  import MonoPartText from '$lib/shared/MonoPartText.svelte'
  import SvgIcon from '$lib/shared/SVGIcon.svelte'
  import { ItemRarity } from '$lib/shared/types/enga'
  import { keysOf } from '$lib/shared/utils/type-safe'
  import WithLoading from '$lib/shared/WithLoading.svelte'
  import ShowcaseCard from '$lib/showcase-card/ShowcaseCard.svelte'
  import cn from 'classnames'
  import _ from 'lodash'
</script>

<div class="flex flex-col items-center">
  <div class="flex flex-col gap-12 md:gap-6 max-w-md md:max-w-lg w-full">
    <Card
      className={{
        container:
          'md:sticky top-[calc(theme(spacing.24)+theme(spacing.4))] md:top-[calc(theme(spacing.28)+theme(spacing.4))] z-20 shadow-[#0005] shadow-xl',
        wrapper: 'flex flex-col gap-1 md:flex-row justify-between',
      }}>
      {#if _.isUndefined($signerAddress$)}
        <span>{$__$.web3Provider.connect.connectButton.notConnected}</span>
      {:else}
        <WithLoading
          data={[$engaBalance$, $solBalance$]}
          className={{ wrapper: 'flex gap-3 h-full' }}>
          <svelte:fragment slot="data">
            {#if !_.isNull($engaBalance$) && !_.isNull($solBalance$)}
              <span class="text-text-secondary">{'ENGA'}</span>
              <span>{$engaBalance$}</span>
              <div class="hidden md:flex border-r border-r-primary-600 h-full" />
              <span class="text-text-secondary">{'SOLAR'}</span>
              <span>{$solBalance$}</span>
            {:else}
              <span>{$__$.main.genericErrorMessage}</span>
            {/if}
          </svelte:fragment>
        </WithLoading>
      {/if}
    </Card>
    <div class="flex justify-between items-center flex-col md:flex-row gap-3">
      <MonoPartText text={$__$?.acquireTickets.moreSolarHint} />
      <Button
        job={() => {
          const dest = routeConfig[Routes.staking].href
          _.isString(dest) && goto(dest)
        }}
        className={cn('border-blood border-2 text-blood font-bold flex items-center gap-2')}>
        <SvgIcon
          width="1.5rem"
          height="1.5rem"
          Icon={routeConfig[Routes.staking].icon}
          className="h-6" />
        <!-- TODO ⬇️ -->
        STAKE
      </Button>
    </div>
    <div
      class="flex flex-col gap-6 w-full children:h-24 md:children:h-28 {$isSafari$
        ? 'z-index-bug-fix'
        : ''}">
      {#each keysOf(ItemRarity) as rarity (rarity)}
        <!-- TODO: owned count -->
        <ShowcaseCard
          type={Routes.mpTickets}
          meta={{ rarity: ItemRarity[rarity], ownedCount: 0 }}
          forSale />
      {/each}
    </div>
  </div>
</div>
