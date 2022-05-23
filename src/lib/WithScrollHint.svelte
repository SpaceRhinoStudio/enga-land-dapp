<script lang="ts">
  import SvgIcon from './SVGIcon.svelte'
  import ScrollTopIcon from '../assets/icons/vuesax-linear-arrow-up-3.svg'
  import _ from 'lodash'
  import { resize_observer } from './actions/resize-observer'
  import type { Bounds } from './types'
  import { canHover$ } from './helpers/media-queries'

  export let className: { [key in 'wrapper' | 'innerWrapper' | 'container' | 'hint']?: string } = {}

  export let goToTopButton: boolean = false
  export let hideThreshold: number = 40
  export let hintDownscaleFactor: { start?: number; end?: number } = {}
  $: {
    if (_.isUndefined(hintDownscaleFactor.start)) {
      hintDownscaleFactor = { ...hintDownscaleFactor, start: 4 }
    }
    if (_.isUndefined(hintDownscaleFactor.end)) {
      hintDownscaleFactor = { ...hintDownscaleFactor, end: 4 }
    }
  }
  export let horizontalScrollButtons: boolean = false

  let outerRef: HTMLElement | undefined

  let outerBounds: Bounds = {
    left: 0,
    top: 0,
    height: 0,
    width: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    paddingX: 0,
    paddingY: 0,
  }

  let innerBounds: Bounds = {
    left: 0,
    top: 0,
    height: 0,
    width: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    paddingX: 0,
    paddingY: 0,
  }

  let scroll = { top: 0, left: 0 }
</script>

<div class="relative overflow-hidden {className.container}">
  <div
    class={`
        max-h-full
        overflow-auto
        ${
          horizontalScrollButtons &&
          $canHover$ &&
          outerBounds.width < outerBounds.scrollWidth &&
          'snap-x snap-mandatory snap-always scrollbar-hide'
        }
        ${className.wrapper}
    `}
    use:resize_observer
    on:resize={e => (outerBounds = e.detail)}
    bind:this={outerRef}
    data-name="outer"
    on:scroll={e => {
      scroll = {
        top: outerRef?.scrollTop ?? 0,
        left: outerRef?.scrollLeft ?? 0,
      }
    }}>
    <div
      use:resize_observer
      on:resize={e => (innerBounds = e.detail)}
      data-name="inner"
      class={`
            ${className?.innerWrapper}
            ${
              horizontalScrollButtons && $canHover$ && outerBounds.width < outerBounds.scrollWidth
                ? 'children:snap-start children:scroll-m-10'
                : ''
            },
        `}>
      <slot />
    </div>
  </div>

  <!-- topHint -->
  <div
    data-name="top-hint"
    class="absolute -top-px left-0 right-0 bg-gradient-to-b to-transparent pointer-events-none select-none -translate-y-px {className?.hint ??
      'from-primary-990'}"
    style="height: {(outerBounds.height + outerBounds.paddingY) /
      (hintDownscaleFactor.start ?? 1)}px; opacity: {Math.min(scroll.top ?? 0, hideThreshold) /
      hideThreshold};" />

  <!-- bottomHint -->
  <div
    data-name="bottom-hint"
    class="absolute -bottom-px left-0 right-0 bg-gradient-to-t to-transparent pointer-events-none select-none {className?.hint ??
      'from-primary-990'}"
    style="height: {(outerBounds.height + outerBounds.paddingY) /
      (hintDownscaleFactor.end ?? 1)}px; opacity: {Math.min(
      innerBounds.height - ((scroll.top ?? 0) + outerBounds.height),
      hideThreshold,
    ) / hideThreshold}" />

  <!-- leftHint -->
  <div
    data-name="left-hint"
    class="absolute -left-px top-0 bottom-0 bg-gradient-to-r to-transparent pointer-events-none select-none {className?.hint ??
      'from-primary-990'}"
    style="width: {(outerBounds.width + outerBounds.paddingX) /
      (hintDownscaleFactor.start ?? 1)}px; opacity: {Math.min(scroll.left ?? 0, hideThreshold) /
      hideThreshold};" />

  <!-- rightHint -->
  <div
    data-name="right-hint"
    class="absolute -right-px top-0 bottom-0 bg-gradient-to-l to-transparent pointer-events-none select-none {className?.hint ??
      'from-primary-990'}"
    style="width: {(outerBounds.width + outerBounds.paddingX) /
      (hintDownscaleFactor.end ?? 1)}px; opacity: {Math.min(
      innerBounds.scrollWidth - ((scroll.left ?? 0) + outerBounds.width),
      hideThreshold,
    ) / hideThreshold};" />
  {#if goToTopButton}
    <!-- goToTopButton -->
    <div
      class="bg-primary-900 rounded-full h-10 w-10 absolute right-4 bottom-4 shadow-lg shadow-primary-990 z-[11] cursor-pointer flex justify-center items-center transition-opacity"
      style="opacity: {Math.floor(
        (Math.min(scroll.top ?? 0, hideThreshold * 10) / (hideThreshold * 10)) * 2,
      )};"
      on:click={() => outerRef?.scroll({ behavior: 'smooth', top: 0 })}>
      <SvgIcon Icon={ScrollTopIcon} width="1.5rem" height="1.5rem" />
    </div>
  {/if}
  {#if horizontalScrollButtons && $canHover$ && outerBounds.width < outerBounds.scrollWidth}
    <!-- scrollRightButton -->
    <div
      class="bg-primary-990 rounded-full h-8 w-8 absolute right-1.5 top-1/2 -translate-y-1/2 z-[11] cursor-pointer flex justify-center items-center transition-opacity"
      style="opacity: {Math.min(
        innerBounds.scrollWidth - ((scroll.left ?? 0) + outerBounds.width),
        hideThreshold,
      ) / hideThreshold};"
      on:click={() =>
        outerRef?.scroll({
          behavior: 'smooth',
          left: (scroll.left ?? 0) + outerBounds.width / 2,
        })}>
      <SvgIcon Icon={ScrollTopIcon} width="1.3rem" height="1.3rem" className="rotate-90" />
    </div>

    <!-- scrollLeftButton -->
    <div
      class="bg-primary-990 rounded-full h-8 w-8 absolute left-1.5 top-1/2 -translate-y-1/2 z-[11] cursor-pointer flex justify-center items-center transition-opacity"
      style="opacity: {Math.min(scroll.left ?? 0, hideThreshold) / hideThreshold};"
      on:click={() =>
        outerRef?.scroll({
          behavior: 'smooth',
          left: (scroll.left ?? 0) - outerBounds.width / 2,
        })}>
      <SvgIcon Icon={ScrollTopIcon} width="1.3rem" height="1.3rem" className="-rotate-90" />
    </div>
  {/if}
</div>
