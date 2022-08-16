<script lang="ts" context="module">
  const zone = Zone.current.fork({ name: 'User:DisconnectWalletButton' })
</script>

<script lang="ts">
  import ConnectWalletModal from './ConnectWalletModal.svelte'
  import Fade from './Fade.svelte'
  import { __$ } from './shared/locales'
  import {
    web3ProviderIdController$,
    signerAddress$,
    currentWeb3ProviderId$,
  } from './observables/selected-web3-provider'
  import ShortenedHash from './ShortenedHash.svelte'
  import SvgIcon from './shared/SVGIcon.svelte'
  import UserIcon from './shared/assets/icons/vuesax-linear-user-octagon.svg'
  import WalletIcon from './shared/assets/icons/empty-wallet-add.svg'
  import LogoutIcon from './shared/assets/icons/logout.svg'
  import DropDown from './shared/DropDown.svelte'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import cn from 'classnames'
  import NetworkSelector from './NetworkSelector.svelte'
  import { fade } from 'svelte/transition'
  import { tsFix } from './shared/helpers/svelte-animation-fix'
  import { noUndefined } from './shared/utils/no-sentinel-or-undefined'
  import { filter, map } from 'rxjs'
  import LoadingSpinner from './shared/LoadingSpinner.svelte'
  import _ from 'lodash'

  export let alwaysExpand = false
  export let upward = false
  export let dir: 'ltr' | 'rtl' = 'rtl'
  let toggle: () => void

  const handleDisconnect = () => {
    zone.run(() =>
      web3ProviderIdController$.next({
        Request: null,
      }),
    )
  }

  const lastSignerAddress$ = signerAddress$.pipe(filter(noUndefined))
  const isConnected$ = lastSignerAddress$.pipe(map(x => !!x?.length))
  const isLoading$ = currentWeb3ProviderId$.pipe(map(_.isUndefined))
</script>

<DropDown {upward} canExpand={$isConnected$} let:isDropped {dir}>
  <div
    class="flex justify-between dropdown group relative transition-all cursor-pointer"
    on:click={e => {
      if (!$isConnected$) {
        toggle()
      }
    }}>
    <div
      class={cn(
        'h-11 w-11 relative rounded-xl flex justify-center items-center shadow-glow transition-all duration-500',
        $isConnected$
          ? ['shadow-secondary-700', $isLoading$ ? 'bg-secondary-700' : 'bg-secondary-500']
          : 'shadow-shiningOrange-faded bg-shiningOrange',
      )}>
      {#if $isLoading$}
        <div class="absolute text-text-hover text-lg" transition:tsFix={[fade, { duration: 500 }]}>
          <LoadingSpinner />
        </div>
      {:else if $isConnected$}
        <div class="absolute text-text-hover" transition:tsFix={[fade, { duration: 500 }]}>
          <SvgIcon Icon={UserIcon} width={'1.5rem'} height={'1.5rem'} />
        </div>
      {:else}
        <div class="absolute" transition:tsFix={[fade, { duration: 500 }]}>
          <SvgIcon Icon={WalletIcon} width={'1.5rem'} height={'1.5rem'} />
        </div>
      {/if}
    </div>
    <span
      class={cn(
        'font-[300] ml-[10px] leading-10 items-center transition-colors duration-500',
        alwaysExpand ? 'flex' : 'md:flex hidden',
        $isConnected$ ? 'text-secondary-500' : 'text-shiningOrange',
      )}>
      <Fade visible={$isConnected$} className={{ container: 'flex items-center' }} mode="width">
        <div class="relative flex justify-between transition-all cursor-pointer">
          <ShortenedHash
            hash={$lastSignerAddress$ ?? ''}
            leading={4}
            trailing={4}
            className="mr-2" />
          {#if !alwaysExpand}
            <SvgIcon
              Icon={ArrowDown}
              height="1.1rem"
              width="1.1rem"
              className="transition-transform {isDropped ? 'rotate-180' : ''}" />
          {/if}
        </div>
      </Fade>
      <Fade visible={!$isConnected$} mode="width">
        {$__$?.header.connectWallet}
      </Fade>
    </span>
  </div>

  <div class="p-5 flex flex-col gap-5" slot="drop">
    <NetworkSelector />
    <button
      class="text-lg text-white flex justify-between my-2 w-full"
      aria-current="page"
      on:click={handleDisconnect}>
      {$__$?.web3Provider.connect.disconnect}
      <SvgIcon Icon={LogoutIcon} className="ml-3 text-blood" width={'1.5rem'} height={'1.5rem'} />
    </button>
  </div>
</DropDown>

<ConnectWalletModal bind:toggle />
