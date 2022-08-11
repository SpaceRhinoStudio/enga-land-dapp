<script context="module" lang="ts">
  export function load(args: { error: unknown; status: string | number }) {
    return {
      props: {
        message: _.get(args.error, 'message'),
        status: args.status,
      },
    }
  }
</script>

<script lang="ts">
  import ErrorPage from '$lib/shared/ErrorPage.svelte'
  import _ from 'lodash'

  export let message: string
  export let status: string | number
</script>

<ErrorPage {message} {status} />
