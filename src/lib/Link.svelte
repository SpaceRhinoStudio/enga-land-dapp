<script lang="ts">
  import { goto } from '$app/navigation'

  import { page } from '$app/stores'
  import _ from 'lodash'
  import { createEventDispatcher } from 'svelte'

  type MatchResult = {
    partial: boolean
    exact: boolean
  }

  function sanitizeHref(href: string) {
    return href.split('/').filter(_.negate(_.isEmpty)).join('/')
  }

  export let element = 'a'
  export let href: string | undefined
  export let disabled = false
  export let className: {
    [key in 'element' | 'exactMatch' | 'partialMatch' | 'text' | 'textEnabled']?: string
  } = {}
  export let newTab = false

  const dispatch = createEventDispatcher<{ click: MouseEvent }>()
  let match: MatchResult = { partial: false, exact: false }

  $: {
    if (!_.isUndefined(href)) {
      const x = sanitizeHref($page.url.pathname)
      match = {
        exact: x === sanitizeHref(href),
        partial:
          `/${x}/`.search(`/${sanitizeHref(href)}${sanitizeHref(href).length ? '/' : ''}`) !== -1,
      }
    }
  }
</script>

<svelte:element
  this={element}
  class={`
    transition-colors duration-300
    ${
      ((match.exact && className.exactMatch) || (match.partial && className.partialMatch)
        ? ''
        : className.text) ?? (match.exact ? 'text-text-hover' : 'text-text-primary')
    }
    ${
      disabled
        ? `text-opacity-30 cursor-not-allowed`
        : `cursor-pointer ${
            ((match.exact && className.exactMatch) || (match.partial && className.partialMatch)
              ? ''
              : className.textEnabled) ?? 'hover:text-text-hover'
          }`
    }
    ${match.exact ? className.exactMatch : match.partial ? className.partialMatch : ''}
    ${className.element ?? ''}`}
  href={!match.exact ? href : undefined}
  rel={href?.includes('://') ? 'external' : undefined}
  target={newTab ? '_blank' : undefined}
  on:click={e => {
    if (disabled) {
      return
    }
    dispatch('click', e)
    if (href && element !== 'a' && !match.exact) {
      goto(href)
    }
  }}>
  <slot {match} />
</svelte:element>
