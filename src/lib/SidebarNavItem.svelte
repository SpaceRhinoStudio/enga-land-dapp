<script lang="ts">
  import type { RouteConfig } from './shared/configs/routes'
  import SvgIcon from './shared/SVGIcon.svelte'
  import ArrowDown from './shared/assets/icons/arrow-down.svg'
  import Link from './Link.svelte'
  import Fade from './Fade.svelte'
  import { __$ } from './shared/locales'
  import { config } from './configs'
  import { onDestroy, onMount } from 'svelte'

  export let item: RouteConfig
  export let className = ''
  export let onRouteChange: () => void = () => {}

  const subRoutes = item.subRoutes?.map(x => config.routeConfig[x]) ?? []
</script>

<Link
  let:match
  href={item.href}
  on:click={() => onRouteChange()}
  disabled={item.disabled}
  element="div"
  className={{ element: `relative text-lg py-3 transition-all ${className}` }}>
  {#if match}
    <div
      class={`
        flex items-center space-x-2
        before:opacity-0
        before:content-[""]
        before:absolute
        before:-left-10
        before:w-6
        before:h-6
        before:shadow-[theme(colors.secondary.600)_0px_0px_20px_5px]
        before:rounded-full
        before:bg-secondary-500
        before:transition-all
        ${match?.partial ? `text-secondary-500 ${match.exact ? 'before:opacity-100' : ''}` : ''}
      `}>
      <SvgIcon Icon={item.icon} width={'1.375rem'} height={'1.375rem'} />
      <span>{$__$?.nav[item.id]}</span>
      {#if subRoutes.length}
        <SvgIcon
          Icon={ArrowDown}
          width={'1.375rem'}
          height={'1.375rem'}
          className="ml-2 transition-all" />
      {/if}
    </div>
    {#if subRoutes.length}
      <div class="-ml-6 py-3 pl-12 left-0">
        {#each subRoutes as sub}
          <svelte:self item={sub} className="-ml-6 pl-6" {onRouteChange} />
        {/each}
      </div>
    {/if}
  {/if}
</Link>
