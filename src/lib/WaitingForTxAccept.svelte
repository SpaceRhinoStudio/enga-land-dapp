<script lang="ts" context="module">
  const zone = Zone.current.fork({ name: 'User:TxRejectModal' })
</script>

<script lang="ts">
  import cn from 'classnames'
  import Card from './Card.svelte'
  import { waitingForTxAcceptController$ } from './contexts/waiting-for-tx-accept'

  import Button from './shared/Button.svelte'
  import Checkbox from './shared/Checkbox.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import LoadingSpinner from './shared/LoadingSpinner.svelte'
  import { __$ } from './shared/locales'
  import Modal from './shared/Modal.svelte'
  import { wrapWith } from './utils/zone'

  let toggle: (state?: boolean) => void

  $: $waitingForTxAcceptController$.Display ? toggle?.(true) : toggle?.(false)
  $: !$waitingForTxAcceptController$.Display && (agreed = false)
  let agreed = false
</script>

<Modal bind:toggle>
  <Card
    className={{
      wrapper: 'flex flex-col w-screen max-w-xs gap-6',
      container: cn($screen$.exact === 'xs' && 'rounded-b-none'),
    }}>
    <div slot="header" class="flex items-center gap-3 w-full ">
      <LoadingSpinner className={{ container: 'text-xl' }} />
      <span>{$__$.web3Provider.waitingForTx.title}</span>
    </div>
    <div class="flex flex-col gap-3">
      {#each $__$.web3Provider.waitingForTx.warningText.split('\n') as line}
        <p class="text-justify">{line}</p>
      {/each}
    </div>
    <Checkbox bind:value={agreed} className={{ wrapper: '!text-sm' }}
      >{$__$.web3Provider.waitingForTx.agreement}</Checkbox>
    <Button
      disabled={!agreed}
      danger
      job={wrapWith(zone, () => waitingForTxAcceptController$.next({ Reject: true }))}>
      {$__$.web3Provider.waitingForTx.rejectButton.toUpperCase()}
    </Button>
  </Card>
</Modal>
