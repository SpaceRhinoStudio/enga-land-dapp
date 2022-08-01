<script context="module" lang="ts">
  export const intro = true
</script>

<script lang="ts">
  import ConnectWalletButton from '$lib/ConnectWalletButton.svelte'

  import EngaPrice from '$lib/EngaPrice.svelte'
  import ImportEnga from '$lib/ImportEnga.svelte'
  import PendingTransactions from '$lib/PendingTransactions.svelte'
  import { Routes } from '$lib/shared/configs/routes'
  import MainLayout from '$lib/shared/MainLayout.svelte'
</script>

<MainLayout
  headerBlurContainer
  footerRoutes={[
    Routes.home,
    Routes.dapp,
    Routes.marketplace,
    Routes.docs,
    Routes.help,
    Routes.aboutUs,
  ]}
  headerRoutes={[Routes.home, Routes.dapp, Routes.marketplace]}
  headerCollapsedRoutes={[
    Routes.docs,
    Routes.help,
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
  <ConnectWalletButton slot="sidebar-foot" alwaysExpand upward dir="ltr" />
  <ImportEnga slot="footer-foot" />
  <EngaPrice slot="footer-metadata" />
</MainLayout>
