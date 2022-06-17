<script lang="ts">
  import { BigNumber } from 'ethers'

  import ShowcaseCardEndro from './ShowcaseCardEndro.svelte'
  import type { EndroItemMeta, EndroMeta, OpifexMeta, RaffleTicketMeta } from '../types/enga'
  import ShowcaseCardOpifex from './ShowcaseCardOpifex.svelte'
  import { MarketplaceItemsType } from '$lib/observables/enga/marketplace-items'
  import { Routes } from '$lib/shared/configs/routes'
  import ShowcaseCardCosmetics from './ShowcaseCardCosmetics.svelte'
  import ShowcaseCardChipset from './ShowcaseCardChipset.svelte'

  export let meta: EndroMeta | OpifexMeta | RaffleTicketMeta | EndroItemMeta
  export let forSale: boolean
  export let type: MarketplaceItemsType
</script>

{#if type === Routes.mpEndro}
  <ShowcaseCardEndro {meta} {forSale} />
{/if}
{#if type === Routes.mpOpifexOff || type === Routes.mpOpifexIndexed}
  <ShowcaseCardOpifex {meta} {forSale} />
{/if}
{#if type === Routes.mpTickets}
  <!-- <RaffleTicketShowcase {...ticketOptions} /> -->
{/if}
{#if type === Routes.mpChipset}
  <ShowcaseCardChipset {meta} {forSale} />
{/if}
{#if type === Routes.mpCosmetics}
  <ShowcaseCardCosmetics {meta} {forSale} />
{/if}
