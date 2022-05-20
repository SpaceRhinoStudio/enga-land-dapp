<script lang="ts">
  import _ from 'lodash'
  import { portalMap } from './actions/portal'
  import RandomTranslate from './RandomTranslate.svelte'
  import IsNavigating from './IsNavigating.svelte'
  import FolllowMouse from './FolllowMouse.svelte'
  import { onDestroy } from 'svelte'

  let isPortalOpen = false
  $: isPortalOpen = !($portalMap.every(x => x.index === null) || $portalMap.length === 0)

  let isLoading = true
  let shouldHide = true
  $: isLoading || isPortalOpen
    ? (shouldHide = true)
    : (timeout = setTimeout(() => {
        shouldHide = isLoading || isPortalOpen
      }, 500))
  let timeout: NodeJS.Timeout
  onDestroy(() => clearTimeout(timeout))
</script>

<IsNavigating bind:isLoading />

<FolllowMouse>
  <div
    class="blur-md h-6 w-6 bg-[#ff0088] shadow-[0px_0px_80px_65px_#ff008840] rounded-full {shouldHide
      ? 'opacity-0 duration-100'
      : 'duration-[3s]'}" />
</FolllowMouse>
<div class="fixed z-[-1] left-0 right-0 flex justify-center items-center h-3/4">
  <div
    class={`w-[95vw] md:w-[80vw] h-auto min-h-[428px] transition-opacity select-none pointer-events-none relative ${
      shouldHide ? 'opacity-0 duration-100' : 'opacity-80 duration-[2s]'
    }`}>
    <div class="absolute h-[428px] flex flex-col justify-between">
      <RandomTranslate className="flex justify-center">
        <div class="h-[90px] w-[90px] border-[5px] border-primary-800 rounded-full" />
      </RandomTranslate>
      <RandomTranslate className="flex justify-start">
        <div
          class="h-[30px] w-[30px] border-[5px] border-primary-800 bg-primary-800 rounded-full" />
      </RandomTranslate>
      <RandomTranslate className="flex justify-end" let:x let:y>
        <div
          style="will-change: box-shadow; box-shadow: {`0px 0px ${Math.min(
            (Math.abs(x) + Math.abs(y)) * 2 + 60,
            150,
          )}px ${
            Math.min((Math.abs(x) + Math.abs(y)) * 2 + 60, 150) / 1.8
          }px rgba(255,206,0,0.15)`};"
          class="md:right-[-80px] right-24 top-[15px] h-[50px] w-[50px] border-[5px] border-[#da0037] rounded-full bg-[rgba(255,206,0,0.15)]" />
      </RandomTranslate>
    </div>
    <div class="absolute right-0 h-[428px] flex flex-col justify-between ">
      <RandomTranslate className="flex justify-center" let:x let:y>
        <div
          style="will-change: box-shadow; box-shadow: {`0px 0px ${Math.min(
            (Math.abs(x) + Math.abs(y)) * 2 + 45,
            150,
          )}px ${
            Math.min((Math.abs(x) + Math.abs(y)) * 2 + 45, 150) / 1.3
          }px rgba(255,206,0,0.15)`};"
          class="md:right-9 -right-6 top-[20px] h-[50px] w-[50px] border-[5px] border-[#FFCE00] bg-[#FFCE00] rounded-full" />
      </RandomTranslate>
      <RandomTranslate className="flex justify-end">
        <div class="h-[30px] w-[30px] border-[5px] border-primary-800 rounded-full" />
      </RandomTranslate>
      <RandomTranslate className="justify-end hidden md:flex">
        <div
          class="top-[90px] right-[70px] h-[90px] w-[90px] border-[5px] border-primary-800 bg-primary-800 rounded-full" />
      </RandomTranslate>
    </div>
  </div>
</div>
