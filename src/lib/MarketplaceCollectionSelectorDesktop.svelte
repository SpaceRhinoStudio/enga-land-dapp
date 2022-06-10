<script lang="ts">
  import Card from './Card.svelte'
  import { config } from './configs'
  import { Routes } from './shared/configs/routes'
  import { screen$ } from './shared/helpers/media-queries'
  import Link from './Link.svelte'
  import { __$ } from './shared/locales'
  import SvgIcon from './shared/SVGIcon.svelte'

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
</script>

{#if !$screen$.isMobile}
  <Card
    className={{
      container: 'sticky top-6',
      wrapper:
        'flex flex-col space-y-7 pr-6 pb-2 max-h-[calc(100vh-theme(spacing.64))] overflow-y-auto',
    }}>
    <span slot="header">{$__$?.marketplace.collectionsTitle}</span>
    {#each routes as x}
      <Link
        href={x.href}
        disabled={x.disabled}
        className={{
          element: 'flex space-x-3',
          text: 'text-text-secondary',
          exactMatch: '!text-text-hover',
        }}>
        <SvgIcon Icon={x.icon} width="1.5rem" height="1.5rem" />
        <span>{$__$?.nav[x.id]}</span>
      </Link>
    {/each}
  </Card>
{/if}
