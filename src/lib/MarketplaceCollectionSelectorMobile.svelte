<script lang="ts">
  import Card from './Card.svelte'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import { Routes } from './shared/configs/routes'
  import Fade from './Fade.svelte'
  import Link from './shared/Link.svelte'
  import { __$ } from './shared/locales'
  import Modal from './Modal.svelte'
  import SvgIcon from './shared/SVGIcon.svelte'
  import { config } from './configs'
  import { screen$ } from './shared/helpers/media-queries'

  const routes = [
    Routes.mpEndro,
    Routes.mpOpifexOff,
    Routes.mpOpifexIndexed,
    Routes.mpCosmetics,
    Routes.mpChipset,
    Routes.mpConsumable,
    Routes.mpAccoutrements,
    Routes.mpSkins,
    Routes.mpTickets,
    Routes.mpListings,
    Routes.mpSales,
    Routes.mpPurchases,
  ].map(x => config.routeConfig[x])
  let isOpen = false
</script>

{#if $screen$.isMobile}
  <div class="contents" on:click={() => (isOpen = true)}>
    <Card className={{ wrapper: 'flex flex-col space-y-4' }}>
      <div class="flex justify-between">
        <span>{$__$?.marketplace.collectionsTitle}</span>
        <SvgIcon Icon={ArrowDown} width="1.2rem" height="1.2rem" className="text-text-secondary" />
      </div>
      {#each routes as x}
        <Link
          href={x.href}
          disabled={x.disabled}
          className={{
            element: 'space-x-3 hidden',
            text: 'text-text-secondary',
            exactMatch: '!flex text-text-hover',
          }}>
          <SvgIcon Icon={x.icon} width="1.5rem" height="1.5rem" />
          <span>{$__$?.nav[x.id]}</span>
        </Link>
      {/each}
    </Card>
  </div>
  <Modal bind:isOpen acceptExit>
    <div class="flex flex-col rounded-t-2xl bg-primary-800 space-y-6 py-6 w-full pl-4">
      {#each routes as x}
        <Link
          href={x.href}
          disabled={x.disabled}
          on:click={() => !x.disabled && (isOpen = false)}
          className={{
            element: 'space-x-3 flex',
            text: 'text-text-secondary',
            exactMatch: 'text-text-hover',
          }}>
          <SvgIcon Icon={x.icon} width="1.5rem" height="1.5rem" />
          <span>{$__$?.nav[x.id]}</span>
        </Link>
      {/each}
    </div>
  </Modal>
{/if}
