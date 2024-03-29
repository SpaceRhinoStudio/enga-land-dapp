<script lang="ts">
  import _ from 'lodash'
  import { crossfade, fade } from 'svelte/transition'
  import { keysOf } from './shared/utils/type-safe'
  import WithScrollHint from './shared/WithScrollHint.svelte'

  const [send, receive] = crossfade({ fallback: node => fade(node), duration: 300 })

  export let className: { [key in 'container' | 'wrapper']?: string } = {}
  export let freeHeaderHeight = false
  export let tabs: Record<string, string> | undefined = undefined
  export let disabledTabs: Record<string, string> | undefined = undefined
  export let tab: string = _.values(tabs)[0]!

  $: tab === undefined && tabs !== undefined && (tab = _.values(tabs)[0]!)
</script>

<div class="bg-primary-800 rounded-xl px-5 pb-5 shadow-xl overflow-hidden {className.container}">
  {#if $$slots.header}
    <div class="flex items-center {!freeHeaderHeight ? 'h-14' : ''}">
      <slot name="header" />
    </div>
    <div class="border-b border-primary-600 -mx-5" />
  {/if}
  {#if tabs}
    <WithScrollHint
      horizontalScrollButtons
      className={{
        container: '-mx-5',
        hint: 'from-primary-800',
        wrapper: 'scrollbar-hide',
        innerWrapper: 'flex h-14 items-center px-5',
      }}>
      {#each keysOf(tabs) as key}
        <div
          on:click={() => !disabledTabs?.[key] && (tab = key)}
          class="text-text-primary h-[calc(100%-1px)] flex items-center relative px-5 {disabledTabs?.[
            key
          ]
            ? 'text-opacity-30 cursor-not-allowed'
            : 'cursor-pointer'}">
          <span class="w-max">
            {tabs[key]}
          </span>
          <div class="top-full left-0 right-0 absolute -translate-y-px">
            {#if tab === key}
              <div
                in:receive={{ key: 0 }}
                out:send={{ key: 0 }}
                class="border-t-2 border-primary-500 duration-300 w-full" />
            {/if}
          </div>
        </div>
      {/each}
    </WithScrollHint>
    <div class="border-b border-primary-600 -mx-5" />
  {/if}
  <div class="mt-5 {$$slots.footer ? 'mb-5' : ''} {className.wrapper}">
    <slot {tab} />
  </div>
  {#if $$slots.footer}
    <div class="border-b border-primary-600 -mx-5" />
    <div class="flex"><slot name="footer" /></div>
  {/if}
</div>
