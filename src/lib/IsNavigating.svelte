<script context="module" lang="ts">
  export const intro = true
</script>

<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { onMount } from 'svelte'

  export let isLoading = true
  export let isNavigating = true
  let isReady = false
  let whitelist = { to: null as string | null }

  beforeNavigate(({ to, cancel }) => {
    if (!whitelist.to && to?.pathname) {
      cancel()
      whitelist.to = to.pathname
      setTimeout(() => {
        goto(whitelist.to ?? '/').then(() => (whitelist.to = null))
      }, 350)
    }
    isNavigating = true
    isLoading = isNavigating || !isReady
  })

  afterNavigate(() => {
    setTimeout(() => {
      isNavigating = false
      isLoading = isNavigating || !isReady
    }, 350)
  })
  onMount(() => {
    isReady = true
    isLoading = isNavigating || !isReady
    setTimeout(() => {
      isNavigating = false
      isLoading = isNavigating || !isReady
    }, 350)
  })
</script>

{#if isReady}
  {#if isLoading}
    <slot name="show" />
  {/if}

  {#if !isLoading}
    <slot name="hide" />
  {/if}

  <slot name="inform" {isLoading} />
{/if}
