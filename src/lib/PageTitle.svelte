<script lang="ts">
  import { page } from '$app/stores'
  import _ from 'lodash'
  import { config } from './configs'
  import { __$ } from './locales'

  function sanitizeRoute(route: string): string {
    return route.replace(/^\//, '').replace(/\/$/, '')
  }

  export const title = undefined as string | undefined

  let _title = ''
  $: {
    const route = _.values(config.routeConfig).find(
      route => sanitizeRoute(route.href) === sanitizeRoute($page.url.pathname),
    )
    _title = route ? $__$.nav[route.id] : $__$.nav.notFound
  }
</script>

<div class="w-full">{title ?? _title}</div>
