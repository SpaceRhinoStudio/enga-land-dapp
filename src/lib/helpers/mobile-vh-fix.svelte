<script lang="ts">
  import { onMount } from 'svelte'

  function updateMobileVH() {
    document.documentElement.style.setProperty(
      '--vh',
      `${document.documentElement.clientHeight * 0.01}px`,
    )
  }

  onMount(() => {
    updateMobileVH()
    window.addEventListener('resize', updateMobileVH)
  })
</script>
