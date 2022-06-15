<script lang="ts">
  import ShowcaseCardEndro from './ShowcaseCardEndro.svelte'
  import type { EndroItemMeta, EndroMeta, OpifexMeta, RaffleTicketMeta } from './types/enga'

  export let endroOptions:
    | {
        endro: EndroMeta
        forSale: boolean
      }
    | undefined = undefined
  export let opifexOptions: { opifex: OpifexMeta; forSale: boolean } | undefined = undefined
  export let ticketOptions:
    | {
        ticket: RaffleTicketMeta
        mode: 'marketplace' | 'acquire' | 'dashboard'
        count?: number
      }
    | undefined = undefined
  export let chipsetOptions:
    | {
        chipset: EndroItemMeta
        forSale: boolean
      }
    | undefined = undefined
  export let cosmeticOptions:
    | {
        cosmetic: EndroItemMeta
        forSale: boolean
      }
    | undefined = undefined
</script>

{#if endroOptions}
  <ShowcaseCardEndro endro={endroOptions.endro} forSale={endroOptions.forSale} />
{/if}
{#if opifexOptions}
  <!-- <OpifexShowcase
            opifex={opifexOptions?.opifex}
            forSale={opifexOptions.forSale}
        /> -->
{/if}
{#if ticketOptions}
  <!-- <RaffleTicketShowcase {...ticketOptions} /> -->
{/if}
{#if chipsetOptions}
  <!-- <ChipsetShowcase {...chipsetOptions} /> -->
{/if}
{#if cosmeticOptions}
  <!-- <CosmeticShowcase {...cosmeticOptions} /> -->
{/if}
