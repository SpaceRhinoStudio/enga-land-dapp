<script lang="ts">
  import FlipCard from '../FlipCard.svelte'
  import ShowcaseCardRawFront from './ShowcaseCardRawFront.svelte'
  import cn from 'classnames'
  import JigglyCard from '$lib/shared/JigglyCard.svelte'
  import { SpringConfig } from 'wobble'

  export let isAutoHeight = false
  export let keepFrontHeight = false
  export let backfaceVisible = false
  export let className: { [key in 'cardHeight']?: string } = {}

  // -- raw front card props
  export let cornerRadius: string | undefined = undefined
  export let cutHeight: string | undefined = undefined
  export let hScale: number | undefined = undefined
  export let cardHeightClassName: string | undefined = undefined

  let jiggleClassname = `relative z-10 ${cardHeightClassName ?? 'h-full'}`
  let jiggleConfig: Partial<SpringConfig> = { damping: 5 }
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
    <ShowcaseCardRawFront {cornerRadius} {cutHeight} {hScale} {cardHeightClassName}>
      <slot />
      <slot name="title" slot="title" />
      <slot name="subtitle" slot="subtitle" />
      <JigglyCard slot="left" className={jiggleClassname} config={jiggleConfig}>
        <slot name="left" />
      </JigglyCard>
    </ShowcaseCardRawFront>
  </FlipCard>
{:else}
  <ShowcaseCardRawFront {cornerRadius} {cutHeight} {hScale} {cardHeightClassName}>
    <slot />
    <slot name="title" slot="title" />
    <slot name="subtitle" slot="subtitle" />
    <JigglyCard slot="left" className={jiggleClassname} config={jiggleConfig}>
      <slot name="left" />
    </JigglyCard>
  </ShowcaseCardRawFront>
{/if}
