<script lang="ts">
  import { fade } from 'svelte/transition'
  import LoadingSpinner from './LoadingSpinner.svelte'

  export let visible: boolean
  export let className: { [key in 'container']?: string } = {}
</script>

{#if visible}
  <div
    transition:fade
    style="transform: translate3d(0, 0, 0);"
    class="absolute inset-0 !m-0 z-30 pointer-events-none select-none flex justify-center items-center {className.container}">
    <LoadingSpinner />
  </div>
{/if}
