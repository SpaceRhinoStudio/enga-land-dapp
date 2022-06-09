<script lang="ts">
  import { page } from '$app/stores'
  import _ from 'lodash'
  import { config } from './configs'
  import { __$ } from './locales'

  function sanitizeRoute(route: string): string {
    return route.replace(/^\//, '').replace(/\/$/, '')
  }

  export let title = undefined as string | undefined
  export let hide = false

  $: route = _.values(config.routeConfig).find(route =>
    _.isString(route.href)
      ? sanitizeRoute(route.href) === sanitizeRoute($page.url.pathname)
      : route.href.test($page.url.pathname),
  )
  $: _title = route ? $__$?.nav[route.id] : $__$?.nav.notFound
</script>

<svelte:head>
  <title>{title ?? _title}</title>
</svelte:head>

{#if !hide}
  <div class="w-full">{title ?? _title}</div>
{/if}
