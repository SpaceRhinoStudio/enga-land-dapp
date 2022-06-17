<script lang="ts">
  import Card from './Card.svelte'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import { Routes } from './shared/configs/routes'
  import Fade from './Fade.svelte'
  import Link from './shared/Link.svelte'
  import { __$ } from './shared/locales'
  import Modal from './shared/Modal.svelte'
  import SvgIcon from './shared/SVGIcon.svelte'
  import { config } from './configs'
  import { screen$ } from './shared/helpers/media-queries'
  import Button from './shared/Button.svelte'
  import WithScrollHint from './shared/WithScrollHint.svelte'
  import cn from 'classnames'
  import { MarketplaceItemsType } from './observables/enga/marketplace-items'
  import { crossfade, fade } from 'svelte/transition'
  import { tick } from 'svelte'
  import { waitForF } from './shared/helpers/wait-for'

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
  let toggle: () => void

  const [send, receive] = crossfade({ fallback: node => fade(node), duration: 300 })

  export let collection: MarketplaceItemsType
</script>

{#if $screen$.isMobile}
  <div class="contents" on:click={toggle}>
    <Card className={{ wrapper: 'flex flex-col space-y-4' }}>
      <div class="flex justify-between">
        <span>{$__$.nav[collection]}</span>
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
  <Modal bind:toggle acceptExit>
    <WithScrollHint
      className={{
        innerWrapper: 'flex flex-col rounded-t-2xl bg-primary-800 py-6 w-full px-4',
        container: 'w-full max-h-[70vh]',
      }}>
      {#each routes as x}
        <Button
          job={() => {
            if (x.disabled) {
              return
            }
            collection = x.id
            tick().then(waitForF(150)).then(toggle)
          }}
          disabled={x.disabled}
          className={cn(
            'relative !duration-150 flex items-center !pl-2 gap-3 !border-none !py-3 disabled:!bg-transparent disabled:!text-primary-600',
            x.id === collection
              ? 'text-secondary-500 hover:!text-secondary-500'
              : 'text-text-secondary',
          )}>
          {#if x.id === collection}
            <div
              in:receive={{ key: 0 }}
              out:send={{ key: 0 }}
              class={cn(
                'absolute',
                '-left-6',
                'w-4',
                'h-4',
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
    </WithScrollHint>
  </Modal>
{/if}
