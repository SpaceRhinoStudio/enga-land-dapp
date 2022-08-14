<script context="module" lang="ts">
  import '../index'
  export const intro = true
</script>

<script lang="ts">
  import ConnectWalletButton from '$lib/ConnectWalletButton.svelte'

  import EngaPrice from '$lib/EngaPrice.svelte'
  import ImportEnga from '$lib/ImportEnga.svelte'
  import PendingTransactions from '$lib/PendingTransactions.svelte'
  import { Routes } from '$lib/shared/configs/routes'
  import MainLayout from '$lib/shared/MainLayout.svelte'

  import DebugButton from '$lib/DebugButton.svelte'
  import { screen$ } from '$lib/shared/helpers/media-queries'
</script>

<MainLayout
  headerBlurContainer
  footerRoutes={[
    Routes.home,
    Routes.marketplace,
    Routes.docs,
    Routes.blog,
    // Routes.help,
    Routes.aboutUs,
  ]}
  headerRoutes={[Routes.home, Routes.dapp, Routes.marketplace]}
  headerCollapsedRoutes={[
    Routes.docs,
    Routes.blog,
    // Routes.help,
    Routes.tokenomics,
    Routes.github,
    Routes.community,
    Routes.aboutUs,
  ]}
  sidebarRoutes={[
    Routes.home,
    Routes.dapp,
    Routes.marketplace,
    Routes.docs,
    Routes.blog,
    Routes.help,
    Routes.tokenomics,
    Routes.github,
    Routes.community,
    Routes.aboutUs,
  ]}>
  <slot />
  <svelte:fragment slot="header-right">
    <PendingTransactions />
    <ConnectWalletButton />
  </svelte:fragment>
  <div slot="sidebar-foot" class="flex justify-between w-full">
    <ConnectWalletButton alwaysExpand upward dir="ltr" />
    {#if $screen$.isMobile}
      <DebugButton />
    {/if}
  </div>
  <div slot="footer-foot" class="flex gap-3">
    <ImportEnga />
    {#if !$screen$.isMobile}
      <DebugButton />
    {/if}
  </div>
  <EngaPrice slot="footer-metadata" />
</MainLayout>
