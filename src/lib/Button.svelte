<script lang="ts">
  import { canHover$, screen$ } from './shared/helpers/media-queries'

  import LoadingOverlay from './LoadingOverlay.svelte'
  export let active = false
  export let danger = false
  export let isLoading = false
  let isJobLoading = false
  export let secondary = false
  export let disabled = false
  export let job: () => Promise<void> | void
  export let className = ''
</script>

<button
  class={`
    ${
      $canHover$ && !(isLoading || isJobLoading || disabled)
        ? 'hover:scale-105 transition-all'
        : 'transition-colors'
    }
    relative
    border
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
        ? 'border-none bg-secondary-800 hover:bg-secondary-600 hover:bg-opacity-50 active:bg-secondary-800 text-secondary-400 bg-opacity-50'
        : danger
        ? 'border-none bg-blood hover:bg-blood bg-opacity-70 active:bg-blood text-rose-200'
        : 'border-primary-600 active:bg-primary-600'
    }
    ${
      isLoading || isJobLoading
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
    if (!isLoading && !isJobLoading && !disabled) {
      isJobLoading = true
      await job()
      isJobLoading = false
    }
  }}
  disabled={isLoading || isJobLoading || disabled}>
  <slot />
  <LoadingOverlay visible={isLoading || isJobLoading} />
</button>
