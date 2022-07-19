<script lang="ts">
  import { BigNumber } from 'ethers'

  import ShowcaseCardEndro from './ShowcaseCardEndro.svelte'
  import type { EndroItemMeta, EndroMeta, OpifexMeta, RaffleTicketMeta } from '../types/enga'
  import ShowcaseCardOpifex from './ShowcaseCardOpifex.svelte'
  import ShowcaseCardTicket from './ShowcaseCardTicket.svelte'
  import { MarketplaceItemsType } from '$lib/observables/enga/marketplace-items'
  import { Routes } from '$lib/shared/configs/routes'
  import ShowcaseCardCosmetics from './ShowcaseCardCosmetics.svelte'
  import ShowcaseCardChipset from './ShowcaseCardChipset.svelte'

  export let meta: EndroMeta | OpifexMeta | RaffleTicketMeta | EndroItemMeta
  export let forSale: boolean
  export let type: MarketplaceItemsType

  function neutralizeType(x: any) {
    return x
  }
</script>

{#if type === Routes.mpEndro}
  <ShowcaseCardEndro meta={neutralizeType(meta)} {forSale} />
{/if}
{#if type === Routes.mpOpifexOff || type === Routes.mpOpifexIndexed}
  <ShowcaseCardOpifex meta={neutralizeType(meta)} {forSale} />
{/if}
{#if type === Routes.mpTickets}
  <ShowcaseCardTicket meta={neutralizeType(meta)} {forSale} />
{/if}
{#if type === Routes.mpChipset}
  <ShowcaseCardChipset meta={neutralizeType(meta)} {forSale} />
{/if}
{#if type === Routes.mpCosmetics}
  <ShowcaseCardCosmetics meta={neutralizeType(meta)} {forSale} />
{/if}
