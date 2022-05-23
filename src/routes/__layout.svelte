<script context="module" lang="ts">
  export const intro = true
</script>

<script lang="ts">
  import '../app.css'
  import Header from '$lib/Header.svelte'
  import MobileVhFix from '$lib/helpers/mobile-vh-fix.svelte'
  import MobileHoverFix from '$lib/helpers/mobile-hover-fix.svelte'
  import MainLoadingOverlay from '$lib/MainLoadingOverlay.svelte'
  import IsNavigating from '$lib/IsNavigating.svelte'
  import { type TransitionConfig } from 'svelte/transition'
  import { portalMap, create_portal_root } from '$lib/actions/portal'
  import _ from 'lodash'
  import { spring } from 'svelte/motion'
  import { onMount, tick } from 'svelte'
  import Footer from '$lib/Footer.svelte'
  import WithScrollHint from '$lib/WithScrollHint.svelte'
  import { zeroIfNegative } from '$lib/utils/zero'

  let shouldBlur = spring(0, { precision: 0.1, stiffness: 0.05 })
  $: shouldBlur.set($portalMap.every(x => x.index === null) || $portalMap.length === 0 ? 0 : 1)

  function fadeAndBlur(node: HTMLElement, { delay = 0, duration = 500 }): TransitionConfig {
    return {
      delay,
      duration,
      css: t => `filter: blur(${(1 - t) * 20}px); opacity: ${t};`,
    }
  }

  let isReady = false
  onMount(() => (isReady = true))
</script>

<MobileHoverFix />
<MobileVhFix />
<MainLoadingOverlay />

<div id="portal_root" use:create_portal_root />

{#if isReady}
  <div in:fadeAndBlur={{ duration: 1200 }}>
    <IsNavigating>
      <div
        slot="hide"
        id="app"
        transition:fadeAndBlur
        style={zeroIfNegative($shouldBlur) === 0
          ? ''
          : `filter: blur(${zeroIfNegative($shouldBlur) * 20}px);`}
        class="w-screen relative">
        <Header />
        <WithScrollHint
          goToTopButton
          hintDownscaleFactor={{ start: 25 }}
          className={{
            container:
              'w-full h-[calc(100vh-theme(spacing.24))] md:h-[calc(100vh-theme(spacing.28))] mt-24 md:mt-28',
            innerWrapper:
              'min-h-[calc(100vh-theme(spacing.24))] md:min-h-[calc(100vh-theme(spacing.28))] flex flex-col',
          }}>
          <main
            class="w-screen max-w-[min(calc(100%-theme(spacing.10)),theme(screens.xl))] children:max-w-full mx-auto py-5 grow flex flex-col">
            <slot />
          </main>
          <Footer />
        </WithScrollHint>
      </div>
    </IsNavigating>
  </div>
{/if}
