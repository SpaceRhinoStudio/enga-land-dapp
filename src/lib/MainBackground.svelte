<script lang="ts">
  import _ from 'lodash'
  import { portalMap } from './shared/actions/portal'
  import RandomTranslate from './shared/RandomTranslate.svelte'
  import FollowMouse from './shared/FollowMouse.svelte'
  import { getContext } from 'svelte'
  import { backdropStyle, BackdropStyleContext } from './shared/MainLayout.svelte'
  import { fade } from 'svelte/transition'
  import { isPageLoading$ } from './shared/observables/is-page-loading'
  import { readable } from 'svelte/store'
  import { isChrome$ } from './shared/contexts/is-firefox'

  let isPortalOpen = false
  $: isPortalOpen = !($portalMap.every(x => x.index === null) || $portalMap.length === 0)

  const isBlurred = getContext<BackdropStyleContext>(backdropStyle)?.isBlurred ?? readable(true)

  $: shouldHide = ($isPageLoading$ ?? true) || ($isChrome$ && ($isBlurred || isPortalOpen))

  export let hideCursorFollower = false
  export let relativeToParent = false

  let x = 10
  let y = 10
</script>

{#if !shouldHide}
  {#if !hideCursorFollower}
    <FollowMouse>
      <div
        out:fade={{ duration: 150 }}
        in:fade
        class="blur-md h-6 w-6 bg-[#ff0088] shadow-[0px_0px_80px_65px_#ff008840] rounded-full" />
    </FollowMouse>
  {/if}

  <div
    out:fade={{ duration: 150 }}
    in:fade
    class="absolute z-[-1] left-0 right-0 flex justify-center items-center h-4/6 pointer-events-none">
    <div
      class="flex justify-between {relativeToParent
        ? 'w-[95%] md:w-[73%]'
        : 'w-[95vw] md:w-[73vw]'} h-full transition-opacity select-none pointer-events-none relative">
      <div class="h-full flex flex-col justify-between md:justify-evenly">
        <RandomTranslate className="flex justify-center">
          <div class="h-20 w-20 border-4 border-primary-800 rounded-full" />
        </RandomTranslate>
        <RandomTranslate className="flex justify-start">
          <div class="h-8 w-8 bg-primary-800 rounded-full" />
        </RandomTranslate>
        <RandomTranslate className="flex justify-end h-12 w-12">
          <div
            style="will-change: box-shadow; box-shadow: {`0px 0px ${Math.min(
              (Math.abs(x) + Math.abs(y)) * 2 + 60,
              150,
            )}px ${
              Math.min((Math.abs(x) + Math.abs(y)) * 2 + 60, 150) / 1.8
            }px rgba(255,206,0,0.15)`};"
            class="absolute -left-3 md:left-36 w-full h-full border-4 border-blood rounded-full bg-yellow-400 bg-opacity-10" />
        </RandomTranslate>
      </div>
      <div class="h-full flex flex-col justify-between md:justify-evenly">
        <RandomTranslate className="flex justify-center h-14 w-14">
          <div
            style="will-change: box-shadow; box-shadow: {`0px 0px ${Math.min(
              (Math.abs(x) + Math.abs(y)) * 2 + 45,
              150,
            )}px ${
              Math.min((Math.abs(x) + Math.abs(y)) * 2 + 45, 150) / 1.3
            }px rgba(255,206,0,0.15)`};"
            class="absolute md:right-28 md:-top-7 -right-6 w-full h-full bg-yellow-400 rounded-full" />
        </RandomTranslate>
        <RandomTranslate className="flex justify-end">
          <div class="h-8 w-8 border-4 border-primary-800 rounded-full" />
        </RandomTranslate>
        <RandomTranslate className="justify-end hidden md:flex h-20 w-20">
          <div class="absolute right-16 w-full h-full bg-primary-800 rounded-full" />
        </RandomTranslate>
      </div>
    </div>
  </div>
{/if}
