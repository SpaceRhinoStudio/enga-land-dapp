<script>
  import { fade } from 'svelte/transition'
  import IsNavigating from './IsNavigating.svelte'
  import LoadingSpinner from './LoadingSpinner.svelte'
</script>

<IsNavigating>
  <div
    slot="show"
    transition:fade={{ duration: 300 }}
    style="transform: translate3d(0, 0, 0)"
    id="preloading_spinner"
    class="flex justify-center items-center fixed inset-0 z-[60] bg-primary-990">
    <LoadingSpinner --big="1" />
  </div>
</IsNavigating>
