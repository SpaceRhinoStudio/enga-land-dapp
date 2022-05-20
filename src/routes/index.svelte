<script context="module" lang="ts">
  export const prerender = true
</script>

<script lang="ts">
  import IndexNavigationItem from '$lib/IndexNavigationItem.svelte'
  import MainBackground from '$lib/MainBackground.svelte'
  import { routeConfig, Routes } from '$lib/configs/routes'
  import { __$ } from '$lib/locales'
  import MarketplaceIcon from '../assets/icons/dapp-market.svg'

  const items = [Routes.marketplace, ...(routeConfig[Routes.dapp].subRoutes ?? [])].map(
    x => routeConfig[x],
  )
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<MainBackground />

<!-- <div class="flex justify-center">
  <Button job={toggle}>connect wallet</Button>
  <ConnectWalletModal bind:toggle />
</div> -->

<div class="flex items-center justify-center w-full grow py-4 h-full">
  <div class="navbar-nav flex flex-wrap items-center justify-center mx-auto w-full max-w-screen-xl">
    {#each items as x}
      <IndexNavigationItem
        title={$__$?.nav[x.id]}
        Icon={x.id !== Routes.marketplace ? x.icon : MarketplaceIcon}
        href={x.href}
        disabled={x.disabled} />
    {/each}
  </div>
</div>
