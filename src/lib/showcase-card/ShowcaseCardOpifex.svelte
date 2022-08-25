<script lang="ts">
  import Button from '$lib/shared/Button.svelte'
  import { flashToast$ } from '$lib/shared/contexts/flash-toast'

  import { __$ } from '$lib/shared/locales'
  import ShowcaseCardImage from './ShowcaseCardImage.svelte'
  import ShowcaseCardRaw from './ShowcaseCardRaw.svelte'
  import cn from 'classnames'
  import type { OpifexMeta } from '$lib/types/enga'

  export let meta: OpifexMeta
  export let forSale: boolean
</script>

<ShowcaseCardRaw>
  <ShowcaseCardImage
    slot="left"
    name={`${$__$?.EngaVerse.mainNFTs.opifex}-${meta.id}`}
    opifexMeta={{
      generation: meta.generation,
      isIndexed: meta.isIndexed,
    }} />
  <span slot="title">{`${$__$?.EngaVerse.mainNFTs.opifex}-${meta.id}`}</span>
  <div class="grow flex flex-col mt-2">
    <div class="flex space-x-2">
      <span>{$__$?.opifex.state.title}:</span>
      <span class={cn(meta.isIndexed ? 'text-secondary-500' : 'text-blood')}>
        {$__$?.opifex.state[meta.isIndexed ? 'indexed' : 'off']}
      </span>
    </div>
    <!-- job={push(`/${forSale ? 'marketplace' : 'dashboard'}/opifex/single#${opifex.id}`)} -->
    <Button
      job={() => flashToast$.next('This is just a demo!')}
      active
      className="md:self-end mt-auto md:px-10">
      {forSale ? $__$?.marketplace.purchase : $__$?.dashboard.manage}
    </Button>
  </div>
</ShowcaseCardRaw>
