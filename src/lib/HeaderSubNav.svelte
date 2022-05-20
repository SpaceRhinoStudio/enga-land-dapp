<script lang="ts">
  import { routeConfig, type Routes } from './configs/routes'
  import Link from './Link.svelte'
  import { __$ } from './locales'
  import SvgIcon from './SVGIcon.svelte'

  export let routes: Routes[]
  const cols = [
    routes.slice(0, Math.ceil(routes.length / 2)),
    routes.slice(Math.ceil(routes.length / 2)),
  ].map(col => col.map(x => routeConfig[x]))
</script>

<div class="ml-3 py-5 flex gap-2 pr-5" aria-labelledby="navbarDropdown">
  {#each cols as col}
    <div class="flex flex-col space-y-0.5">
      {#each col as x}
        <Link
          href={x.href}
          disabled={x.disabled}
          className={{
            exactMatch: 'text-secondary-500 hover:text-secondary-400',
            element: [
              'flex gap-3 items-center rounded-xl p-3 border-2 border-transparent transition-colors duration-500',
              !x.disabled ? 'hover:border-primary-600 hover:bg-primary-700' : '',
            ].join(' '),
          }}>
          <SvgIcon Icon={x.icon} width="2rem" height="2rem" />
          <div class="whitespace-nowrap">
            {$__$?.nav[x.id]}
          </div>
        </Link>
      {/each}
    </div>
  {/each}
</div>
