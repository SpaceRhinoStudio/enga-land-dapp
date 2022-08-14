<script lang="ts">
  import _ from 'lodash'
  import Button from './shared/Button.svelte'
  import Card from './Card.svelte'
  import { config } from './configs'
  import ConnectWalletModalSingleItem from './ConnectWalletModalSingleItem.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import { __$ } from './shared/locales'
  import Modal from './shared/Modal.svelte'
  import type { Web3ProviderId } from './types'
  import { keysOf } from './shared/utils/type-safe'
  import { crossfade, fade } from 'svelte/transition'
  import { flip, tsFix } from './shared/helpers/svelte-animation-fix'
  import NetworkSelector from './NetworkSelector.svelte'
  import { web3ProviderIdController$ } from './observables/selected-web3-provider'
  import { clearCache } from './operators/web3/provider'
  import { fallbackWeb3Provider$ } from './observables/web3-providers/fallback-provider'

  export let toggle: () => void
  export let loading = 'fallback' as Web3ProviderId | null | 'fallback'
  $: !_.isNil($fallbackWeb3Provider$) && setTimeout(() => (loading = null), 1000)

  const [send, receive] = crossfade({ fallback: node => fade(node), duration: 300 })
</script>

<Modal bind:toggle on:requestExit={() => !loading && toggle()}>
  <Card
    className={{
      container: `${
        $screen$.exact === 'xs' ? '!rounded-b-none' : ''
      } w-full sm:max-w-lg max-w-md md:max-w-2xl`,
      wrapper: 'flex flex-col justify-center items-center gap-4 relative w-full',
    }}>
    <span slot="header">{$__$?.web3Provider.connect.title}</span>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 scale-125 pointer-events-none z-10">
      {#each keysOf(config.Web3Providers).filter( key => ($screen$.exact === 'xs' ? false : key === loading), ) as key (key)}
        <div
          class="pointer-events-auto"
          in:tsFix={[receive, { key: key }]}
          out:tsFix={[send, { key: key }]}>
          <ConnectWalletModalSingleItem id={key} requestExit={toggle} bind:loading />
        </div>
      {/each}
    </div>
    <div class="flex flex-wrap justify-center items-center relative z-0">
      {#each keysOf(config.Web3Providers).filter( key => ($screen$.exact === 'xs' ? true : key !== loading), ) as key (key)}
        <div
          in:tsFix={[receive, { key }]}
          out:tsFix={[send, { key }]}
          animate:flip
          class="w-1/2 sm:w-auto">
          <ConnectWalletModalSingleItem id={key} requestExit={toggle} bind:loading />
        </div>
      {/each}
    </div>
    <div class="flex items-center justify-between w-full py-3 sm:py-0">
      <span>Trouble connecting?</span>
      <Button className="text-sm !my-0" job={clearCache}>Clear cache</Button>
    </div>
    <div class="flex items-center justify-between w-full py-3 sm:py-0">
      <NetworkSelector />
      <Button
        className="text-sm border-transparent text-secondary-500 !my-0"
        isLoading={!!loading}
        job={toggle}>
        {$__$?.userInteraction.confirmation.cancel.toUpperCase()}
      </Button>
    </div>
  </Card>
</Modal>
