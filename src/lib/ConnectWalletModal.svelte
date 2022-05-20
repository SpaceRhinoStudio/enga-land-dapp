<script lang="ts">
  import { fade } from 'svelte/transition'

  import Button from './Button.svelte'
  import Card from './Card.svelte'
  import { config } from './configs'
  import { Network } from './configs/web3'
  import ConnectWalletModalSingleItem from './ConnectWalletModalSingleItem.svelte'
  import Fade from './Fade.svelte'
  import { deviceScreen$ } from './helpers/media-queries'
  import { __$ } from './locales'
  import Modal from './Modal.svelte'
  import { selectedNetwork$, selectedNetworkController$ } from './observables/web3-network'
  import Select from './Select.svelte'
  import type { Web3ProviderId } from './types'
  import { keysOf } from './utils/type-safe'

  export let toggle: () => void
  export let loading = null as Web3ProviderId | null
</script>

<Modal acceptExit bind:toggle let:isOpen>
  <Card
    className={{
      container: `w-full sm:w-auto ${$deviceScreen$ === 'xs' ? '!rounded-b-none' : ''}`,
      wrapper: 'flex flex-col justify-center items-center gap-4',
    }}>
    <span slot="header">{$__$?.web3Provider.connect.title}</span>
    <div class="flex flex-wrap justify-center items-center">
      {#each keysOf(config.Web3Providers) as key}
        <ConnectWalletModalSingleItem id={key} requestExit={toggle} {loading} />
      {/each}
    </div>
    <div class="flex items-center justify-between w-full py-3 sm:py-0">
      <Select
        value={$selectedNetwork$}
        on:change={x => selectedNetworkController$.next({ Set: x.detail })}>
        <optgroup label="Live">
          <option value={Network.BSCMainnet}>
            {config.Chains.bsc.config.chainName}
          </option>
        </optgroup>
        <optgroup label="Test">
          <option value={Network.BSCTestnet}>
            {config.Chains.bscTestnet.config.chainName}
          </option>
          <option value={Network.Local}>
            {config.Chains.localhost.config.chainName}
          </option>
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
