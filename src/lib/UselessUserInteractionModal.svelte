<script lang="ts">
  import cn from 'classnames'
  import Card from './Card.svelte'

  import { uselessInteractionController$ } from './contexts/useless-interaction'
  import Button from './shared/Button.svelte'
  import { screen$ } from './shared/helpers/media-queries'
  import { __$ } from './shared/locales'
  import Modal from './shared/Modal.svelte'

  let toggle: (state?: boolean) => void

  $: $uselessInteractionController$.Display === null ? toggle?.(false) : toggle?.(true)
</script>

<Modal bind:toggle acceptExit>
  <Card
    className={{
      wrapper: 'flex flex-col w-screen max-w-xs gap-6',
      container: cn($screen$.exact === 'xs' && 'rounded-b-none'),
    }}>
    <span slot="header">Alert</span>
    <span>{$uselessInteractionController$.Display}</span>
    <Button job={() => uselessInteractionController$.next({ Display: null })}>
      {$__$.main.ok}
    </Button>
  </Card>
</Modal>
