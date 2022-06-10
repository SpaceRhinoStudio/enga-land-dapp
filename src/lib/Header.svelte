<script lang="ts">
  import { routeConfig, Routes } from './shared/configs/routes'
  import Link from './Link.svelte'
  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'
  import SidebarToggleIcon from './shared/assets/icons/vuesax-linear-category-2.svg'
  import Logo from '../assets/EngalandLogo.svg'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import DropDown from './shared/DropDown.svelte'
  import HeaderSubNav from './HeaderSubNav.svelte'
  import ConnectWalletButton from './ConnectWalletButton.svelte'
  import Sidebar from './Sidebar.svelte'
  import { config } from './configs'
  import { routeMatch } from './helpers/route-match'
  import { page } from '$app/stores'
  import _ from 'lodash'

  let isPreview = false
  $: isPreview =
    _.values(config.routeConfig).find(x => routeMatch(x.href, $page.url.pathname).exact)?.preview ??
    false
  const routes = [Routes.home, Routes.dapp, Routes.marketplace].map(x => routeConfig[x])

  let isOpen = false
</script>

<header
  class="h-24 md:h-28 bg-primary-800 fixed top-0 left-0 right-0 z-40 md:shadow-float flex items-center">
  <nav
    class="max-w-[min(calc(100%-theme(spacing.10)),theme(screens.2xl))] w-screen text-text-primary flex items-center justify-between mx-auto">
    <div class="md:hidden cursor-pointer" on:click={() => (isOpen = true)}>
      <SvgIcon Icon={SidebarToggleIcon} width={'1.75rem'} height={'1.75rem'} />
    </div>
    <Link
      href="/"
      className={{
        element: 'absolute md:relative left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0',
      }}>
      <div class="relative">
        <SvgIcon
          Icon={Logo}
          width={'6.8rem'}
          height={'3.1rem'}
          dontFill
          className={isPreview ? '-translate-y-3' : ''} />
        {#if isPreview}
          <div
            class="absolute top-full -translate-y-2 md:-translate-y-1 -left-1/2 md:left-1/2 -right-1/2 md:-translate-x-1/2 animate-pulse">
            <div
              class="md:bg-red-700 rounded-lg p-1 md:text-xs text-center text-red-700 font-bold md:text-text-primary md:font-normal">
              Preview Data
            </div>
          </div>
        {/if}
      </div>
    </Link>
    <ul class="grow children:h-full ml-12 h-10 hidden md:flex children:px-3">
      {#each routes as nav}
        <DropDown let:isDropped className={{ container: 'flex items-center' }}>
          <Link
            href={nav.href}
            disabled={nav.disabled}
            className={{ element: 'flex items-center' }}>
            {$__$?.nav[nav.id]}
            {#if nav.subRoutes?.length}
              <SvgIcon
                Icon={ArrowDown}
                width={'1.1rem'}
                height={'1.1rem'}
                className="ml-2 transition-all {isDropped
                  ? 'rotate-180 text-text-primary'
                  : ''} translate-y-0.5" />
            {/if}
          </Link>
          <div slot="drop">
            {#if nav.subRoutes}
              <HeaderSubNav routes={nav.subRoutes} />
            {/if}
          </div>
        </DropDown>
      {/each}
      <DropDown
        let:isDropped
        className={{
          container: 'relative transition-all text-text-primary px-2 cursor-pointer h-full',
        }}>
        <span
          class={`
              flex
              h-full
              items-center
              gap-0.5
              children:rounded-full
              children:h-2
              children:w-2
              children:border-2
              children:border-text-primary
              children:transition-all
              children:duration-300
              ${isDropped ? 'children:bg-text-primary' : ''}
            `}
          onClick={e => e.stopPropagation()}>
          <div />
          <div class="delay-100" />
          <div class="delay-200" />
        </span>
        <div slot="drop">
          <HeaderSubNav
            routes={[
              Routes.docs,
              Routes.help,
              Routes.tokenomics,
              Routes.github,
              Routes.community,
              Routes.aboutUs,
            ]} />
        </div>
      </DropDown>
    </ul>
    <div class="flex gap-4 items-center">
      <!-- <PendingTransactions /> -->
      <ConnectWalletButton />
    </div>
  </nav>
</header>
<Sidebar bind:isOpen />
