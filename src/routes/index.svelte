<script context="module" lang="ts">
  export const prerender = true
</script>

<script lang="ts">
  import IndexNavigationItem from '$lib/IndexNavigationItem.svelte'
  import MainBackground from '$lib/MainBackground.svelte'
  import { routeConfig, Routes } from '$lib/shared/configs/routes'
  import { __$ } from '$lib/shared/locales'
  import _ from 'lodash'
  import MarketplaceIcon from '../lib/shared/assets/icons/dapp-market.svg'

  const items = [Routes.marketplace, ...(routeConfig[Routes.dapp].subRoutes ?? [])].map(
    x => routeConfig[x],
  )
</script>

<svelte:head>
  <title>ENGA LAND</title>
  <meta name="description" content="EngaLand Dapp" />
</svelte:head>

<MainBackground />

<div class="grow w-screen !max-w-screen-xl self-center flex items-center py-4">
  <div class="grow flex flex-wrap justify-center">
    {#each items as x}
      <IndexNavigationItem
        title={$__$?.nav[x.id]}
        Icon={x.id !== Routes.marketplace ? x.icon : MarketplaceIcon}
        href={_.isString(x.href) ? x.href : '/'}
        disabled={x.disabled} />
    {/each}
  </div>
</div>
