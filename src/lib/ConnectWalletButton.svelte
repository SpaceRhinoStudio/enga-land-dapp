<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import ConnectWalletModal from './ConnectWalletModal.svelte'
  import Fade from './Fade.svelte'
  import { __$ } from './locales'
  import {
    SelectedWeb3ProviderIdController$,
    signerAddress$,
  } from './observables/selected-web3-provider'
  import ShortenedHash from './ShortenedHash.svelte'
  import SvgIcon from './SVGIcon.svelte'
  import UserIcon from '../assets/icons/vuesax-linear-user-octagon.svg'
  import WalletIcon from '../assets/icons/empty-wallet-add.svg'
  import LogoutIcon from '../assets/icons/logout.svg'
  import DropDown from './DropDown.svelte'
  import ArrowDown from '../assets/icons/arrow-down.svg'

  export let alwaysExpand = false
  export let upward = false
  let toggle: () => void
</script>

<DropDown
  {upward}
  canExpand={!!$signerAddress$?.length}
  let:isDropped
  className={{ dropContainer: '!left-auto right-0' }}>
  <div
    class="flex justify-between dropdown group relative transition-all cursor-pointer"
    on:click={e => {
      if (!$signerAddress$?.length) {
        toggle()
      }
    }}>
    <SvgIcon
      Icon={$signerAddress$?.length ? UserIcon : WalletIcon}
      width={'1.5rem'}
      height={'1.5rem'}
      className="h-11 w-11 bg-secondary-500 rounded-xl justify-center items-center text-text-hover shadow-glow shadow-secondary-700" />
    <span
      class="text-secondary-500 font-[300] ml-[10px] leading-10 items-center {alwaysExpand
        ? 'flex'
        : 'md:flex hidden'}">
      <Fade
        visible={!!$signerAddress$?.length}
        className={{ container: 'flex items-center' }}
        mode="width">
        <div class="relative flex justify-between transition-all cursor-pointer">
          <ShortenedHash hash={$signerAddress$ ?? ''} leading={4} trailing={4} className="mr-2" />
          {#if !alwaysExpand}
            <SvgIcon
              Icon={ArrowDown}
              height="1.1rem"
              width="1.1rem"
              className="transition-transform {isDropped ? 'rotate-180' : ''}" />
          {/if}
        </div>
      </Fade>
      <Fade visible={!$signerAddress$?.length} mode="width">
        {$__$?.header.connectWallet}
      </Fade>
    </span>
  </div>

  <ul class="p-5" slot="drop">
    <li class="w-min">
      <button
        class="text-lg text-white flex justify-between  my-2 w-min"
        aria-current="page"
        on:click={() =>
          SelectedWeb3ProviderIdController$.next({
            Unset: true,
          })}>
        {$__$?.web3Provider.connect.disconnect}
        <SvgIcon Icon={LogoutIcon} className="ml-3 text-blood" width={'1.5rem'} height={'1.5rem'} />
      </button>
    </li>
  </ul>
</DropDown>

<ConnectWalletModal bind:toggle />
