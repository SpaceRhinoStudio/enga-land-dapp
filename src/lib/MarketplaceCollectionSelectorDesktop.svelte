<script lang="ts">
  import cn from 'classnames'
  import { crossfade, fade } from 'svelte/transition'
  import Card from './Card.svelte'
  import { config } from './configs'
  import { MarketplaceItemsType } from './observables/enga/marketplace-items'
  import Button from './shared/Button.svelte'
  import { Routes } from './shared/configs/routes'
  import { screen$ } from './shared/helpers/media-queries'
  import Link from './shared/Link.svelte'
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
  const [send, receive] = crossfade({ fallback: node => fade(node), duration: 300 })
  export let collection: MarketplaceItemsType
</script>

{#if !$screen$.isMobile}
  <Card
    className={{
      container:
        'sticky top-[calc(theme(spacing.24)+theme(spacing.4))] md:top-[calc(theme(spacing.28)+theme(spacing.4))]',
      wrapper:
        'flex flex-col gap-1 !mt-3 pt-1 -ml-5 pl-2 pr-6 pb-2 max-h-[calc(100vh-theme(spacing.64))] overflow-y-auto',
    }}>
    <span slot="header">{$__$?.marketplace.collectionsTitle}</span>
    {#each routes as x}
      <Button
        job={() => void (collection = x.id)}
        disabled={x.disabled}
        className={cn(
          'relative flex gap-3 !border-transparent !py-3 !pl-3 disabled:!bg-transparent disabled:!text-primary-600 hover:!scale-100',
          x.id === collection
            ? 'text-secondary-500 hover:!text-secondary-500 hover:!cursor-default'
            : 'text-text-secondary',
        )}>
        {#if x.id === collection}
          <div
            in:receive={{ key: 0 }}
            out:send={{ key: 0 }}
            class={cn(
              'absolute',
              '-left-7',
              'w-6',
              'h-6',
              'shadow-[theme(colors.secondary.600)_0px_0px_20px_5px]',
              'rounded-full',
              'bg-secondary-500',
              'transition-all',
            )} />
        {/if}
        <SvgIcon Icon={x.icon} width="1.5rem" height="1.5rem" />
        <span>{$__$?.nav[x.id]}</span>
      </Button>
    {/each}
  </Card>
{/if}
