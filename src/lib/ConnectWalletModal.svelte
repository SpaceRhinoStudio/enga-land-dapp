<script lang="ts">
  import _ from 'lodash'

  import Button from './shared/Button.svelte'
  import Card from './Card.svelte'
  import { config } from './configs'
  import { Network } from './configs/web3'
  import ConnectWalletModalSingleItem from './ConnectWalletModalSingleItem.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import { __$ } from './shared/locales'
  import Modal from './shared/Modal.svelte'
  import { selectedNetwork$, selectedNetworkController$ } from './observables/web3-network'
  import Select from './Select.svelte'
  import type { Web3ProviderId } from './types'
  import { keysOf } from './shared/utils/type-safe'
  import { crossfade, fade } from 'svelte/transition'
  import { flip, tsFix } from './shared/helpers/svelte-animation-fix'

  export let toggle: () => void
  export let loading = null as Web3ProviderId | null

  const [send, receive] = crossfade({ fallback: node => fade(node), duration: 300 })

  const liveNetworks = _.filter(config.Chains, val => val.isLive)
  const testNetworks = _.filter(config.Chains, val => !val.isLive)
</script>

<Modal bind:toggle on:requestExit={() => !loading && toggle()}>
  <Card
    className={{
      container: `${$screen$.exact === 'xs' ? '!rounded-b-none' : ''} w-full sm:max-w-xl max-w-md`,
      wrapper: 'flex flex-col justify-center items-center gap-4 relative w-full',
    }}>
    <span slot="header">{$__$?.web3Provider.connect.title}</span>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 scale-125 pointer-events-none z-10">
      {#each keysOf(config.Web3Providers).filter(key => key === loading) as key (key)}
        <div
          class="pointer-events-auto"
          in:tsFix={[receive, { key: key }]}
          out:tsFix={[send, { key: key }]}>
          <ConnectWalletModalSingleItem id={key} requestExit={toggle} {loading} />
        </div>
      {/each}
    </div>
    <div class="flex flex-wrap justify-center items-center relative z-0">
      {#each keysOf(config.Web3Providers).filter(key => key !== loading) as key (key)}
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
      <Select
        value={$selectedNetwork$}
        on:change={x => selectedNetworkController$.next({ Set: x.detail })}>
        <optgroup label={$__$?.web3Provider.networks.live}>
          {#each liveNetworks as x}
            <option value={x.network.name}>
              {x.config.chainName}
            </option>
          {/each}
        </optgroup>
        <optgroup label={$__$?.web3Provider.networks.test}>
          {#each testNetworks as x}
            <option value={x.network.name}>
              {x.config.chainName}
            </option>
          {/each}
        </optgroup>
      </Select>
      <Button
        className="text-sm border-0 text-secondary-500 !my-0"
        isLoading={!!loading}
        job={toggle}>
        {$__$?.userInteraction.confirmation.cancel.toUpperCase()}
      </Button>
    </div>
  </Card>
</Modal>
