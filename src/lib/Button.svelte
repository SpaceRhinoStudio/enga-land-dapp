<script lang="ts">
  import LoadingOverlay from './LoadingOverlay.svelte'
  export let active = false
  export let isLoading = false
  export let secondary = false
  export let disabled = false
  export let job: () => Promise<void> | void
  export let className = ''
</script>

<button
  class={`
    relative
    border
    transition-colors
    duration-500
    disabled:border-gray-500
    disabled:bg-gray-800
    disabled:bg-opacity-30
    disabled:text-gray-500
    hover:border-gray-400
    hover:text-text-hover
    disabled:cursor-not-allowed
    ${
      active
        ? 'border-none bg-secondary-800 active:bg-secondary-800 text-secondary-400 bg-opacity-50'
        : 'border-primary-600 active:bg-primary-600'
    }
    ${
      isLoading
        ? 'cursor-wait disabled:cursor-wait text-transparent hover:text-transparent disabled:text-transparent'
        : ''
    }
    ${
      secondary
        ? 'py-1 px-2 rounded-xl text-xs bg-primary-600 leading-none'
        : 'py-2 px-4 rounded-lg'
    }
    ${className}
`}
  on:click={async () => {
    if (!isLoading && !disabled) {
      isLoading = true
      await job()
      isLoading = false
    }
  }}
  disabled={isLoading || disabled}>
  <slot />
  <LoadingOverlay visible={!!isLoading} />
</button>
