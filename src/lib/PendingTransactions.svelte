<script lang="ts">
  import cn from 'classnames'
  import _ from 'lodash'
  import Fade from './Fade.svelte'
  import Link from './shared/Link.svelte'
  import LoadingSpinner from './shared/LoadingSpinner.svelte'
  import SvgIcon from './shared/SVGIcon.svelte'
  import ShortenedHash from './ShortenedHash.svelte'
  import LinkIcon from '$lib/shared/assets/icons/vuesax-linear-link-1.svg'
  import { __$ } from './shared/locales'
  import { pendingTransactions$ } from './operators/web3/pending-transactions'
  import { selectedNetwork$ } from './observables/web3-network'
  import { config } from './configs'
  import DropDown from './shared/DropDown.svelte'
  import { tsFix, flip } from './shared/helpers/svelte-animation-fix'
  import { keysOf } from './shared/utils/type-safe'
  import { fade, slide } from 'svelte/transition'
  import { screen$ } from './shared/helpers/media-queries'
</script>

{#if keysOf($pendingTransactions$).length}
  <DropDown
    dir={$screen$.isMobile ? 'rtl' : 'ltr'}
    className={{ dropContainer: 'flex flex-col p-5 gap-3' }}>
    <div
      transition:tsFix={[fade]}
      class={cn(
        'transition-all rounded-xl',
        'shadow-glow shadow-shiningOrange-faded bg-shiningOrange text-text-hover',
        'flex justify-between cursor-pointer',
      )}>
      <div
        class={cn(
          'flex gap-3 h-11 items-center justify-center aspect-square md:aspect-auto md:px-4',
        )}>
        <LoadingSpinner className={{ container: 'text-lg' }} />
        <span class="hidden md:flex md:gap-1 text-sm">
          <span>{keysOf($pendingTransactions$).length}</span>
          <span>{$__$?.userInteraction.web3.pendingTx}</span>
        </span>
      </div>
    </div>

    <svelte:fragment slot="drop">
      {#each _.values($pendingTransactions$) as tx (tx.hash)}
        <div animate:flip out:tsFix={[slide]}>
          <Link
            newTab
            href={$selectedNetwork$
              ? config.Chains[$selectedNetwork$].config.blockExplorerUrls?.[0] + 'tx/' + tx.hash ??
                '' ??
                ''
              : ''}
            className={{
              element: 'flex space-x-2',
            }}>
            <SvgIcon Icon={LinkIcon} width="1.5rem" height="1.5rem" />
            <ShortenedHash hash={tx.hash ?? ''} />
          </Link>
        </div>
      {/each}
    </svelte:fragment>
  </DropDown>
{/if}
