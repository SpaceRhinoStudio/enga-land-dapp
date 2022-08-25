<script lang="ts">
  import Button from '$lib/shared/Button.svelte'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'

  import { screen$ } from '$lib/shared/helpers/media-queries'
  import { __$ } from '$lib/shared/locales'
  import { RaffleTicketMeta } from '$lib/types/enga'
  import _ from 'lodash'
  import RaffleTicket from './RaffleTicket.svelte'

  import ShowcaseCardRaw from './ShowcaseCardRaw.svelte'

  export let meta: RaffleTicketMeta
  export let forSale: boolean

  let isAquireTicketMode = forSale && !_.isUndefined(meta.ownedCount)
</script>

<ShowcaseCardRaw
  cornerRadius={$screen$.isMobile ? '0.6rem' : '0.75rem'}
  cutHeight={$screen$.isMobile ? '0.6rem' : '1rem'}
  hScale={$screen$.isMobile ? 0.8 : 1}
  cardHeightClassName="h-full">
  <span slot="title">
    <!-- TODO: marketplace title -->
    {isAquireTicketMode || !forSale ? $__$?.EngaVerse.rarityLevels[meta.rarity] : ''}
  </span>
  <span slot="subtitle">
    {#if !_.isUndefined(meta.ownedCount)}
      <span class="text-text-secondary text-xs leading-none">
        {`You own: `}
        {meta.ownedCount}
      </span>
    {/if}
  </span>
  <RaffleTicket slot="left" className={{ container: 'h-full' }} rarity={meta.rarity} />
  <div class="flex flex-col h-full">
    {#if !forSale}
      <div class="flex space-x-4 mt-auto">
        <Button
          job={() =>
            // TODO: interaction UI/UX needed for listing ticket on marketplace
            flashToast$.next('This is just a demo!')}
          secondary
          className="">
          {$__$?.dashboard.listInMarketplace}
        </Button>
      </div>
    {/if}
    {#if isAquireTicketMode}
      <Button
        job={() => flashToast$.next('This is just a demo!')}
        secondary
        className="md:self-end mt-auto">
        {$__$?.marketplace.purchase}
      </Button>
    {/if}
  </div>
</ShowcaseCardRaw>
