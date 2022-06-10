<script lang="ts">
  import CardCut from './CardCut.svelte'
  import { canHover$, screen$ } from './shared/helpers/media-queries'
  import cn from 'classnames'

  export let cutHeight: string | undefined = undefined
  export let cornerRadius: string | undefined = undefined
  export let hScale: number | undefined = undefined
  export let cardHeightClassName: string | undefined = undefined
</script>

<div class="flex w-full md:drop-shadow-2xl">
  <slot name="left" />
  <CardCut
    mode="inCutLeft"
    cutHeight={cutHeight ?? ($screen$.isMobile ? '1.2rem' : '1.9rem')}
    hScale={hScale ?? ($screen$.isMobile ? 1 : 1.3)}
    cornerRadius={cornerRadius ?? '0.75rem'}
    className={{
      container: 'flex w-full drop-shadow-sm',
      wrapper: cn(
        'bg-primary-800 w-full h-full',
        $canHover$ && 'transition-all duration-300 hover:brightness-125',
      ),
    }}>
    <div
      class={cn(
        'pl-5 md:p-5 p-2.5 md:space-y-4 flex flex-col',
        cardHeightClassName ?? 'h-40 md:h-72',
      )}>
      <div class="flex flex-col md:flex-row justify-between w-full space-y-0 md:space-y-0">
        {#if $$slots.title}
          <div class="font-bold md:text-xl text-md leading-none">
            <slot name="title" />
          </div>
        {/if}
        {#if $$slots.subtitle}
          <slot name="subtitle" />
        {/if}
      </div>
      <slot />
    </div>
  </CardCut>
</div>
