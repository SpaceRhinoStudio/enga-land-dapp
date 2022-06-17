<script lang="ts">
  import FlipCard from '../FlipCard.svelte'
  import ShowcaseCardRawFront from './ShowcaseCardRawFront.svelte'
  import cn from 'classnames'

  export let isAutoHeight = false
  export let keepFrontHeight = false
  export let backfaceVisible = false
  export let className: { [key in 'cardHeight']?: string } = {}
</script>

{#if $$slots.backface}
  <FlipCard
    noWidthSet
    {...isAutoHeight ? { noHeightSet: false } : { noHeightSet: true }}
    setHeightFrom={keepFrontHeight ? 'front' : undefined}
    bind:backfaceVisible
    className={{
      container: cn('w-full', className.cardHeight ?? 'h-40 md:h-72'),
      wrapper: 'flex',
      backfaceWrapper: 'flex',
    }}>
    <slot name="backface" slot="backface" />
    <ShowcaseCardRawFront>
      <slot />
      <slot name="title" slot="title" />
      <slot name="subtitle" slot="subtitle" />
      <slot name="left" slot="left" />
    </ShowcaseCardRawFront>
  </FlipCard>
{:else}
  <ShowcaseCardRawFront>
    <slot />
    <slot name="title" slot="title" />
    <slot name="subtitle" slot="subtitle" />
    <slot name="left" slot="left" />
  </ShowcaseCardRawFront>
{/if}
