<script lang="ts">
  import Button from './shared/Button.svelte'
  import { importEnga } from './helpers/import-enga'
  import SvgIcon from './shared/SVGIcon.svelte'
  import MetamaskIcon from '../assets/wallet-providers/metamask-logo.svg'
  import { __$ } from './shared/locales'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import _ from 'lodash'
  import { combineLatest, debounceTime, map, startWith } from 'rxjs'
  import cn from 'classnames'
  import { currentWeb3Provider$ } from './observables/selected-web3-provider'

  const isLoading$ = EngaTokenContract$.pipe(map(_.isUndefined), debounceTime(500), startWith(true))
  const noWeb3Provider$ = currentWeb3Provider$.pipe(map(_.isNil), startWith(true))
  const isUnavailable$ = combineLatest([
    noWeb3Provider$,
    EngaTokenContract$.pipe(map(_.isNil), debounceTime(500)),
  ]).pipe(
    map(x => x.some(x => x)),
    startWith(true),
  )
</script>

<!-- TODO: tl ⬇️ -->
<Button
  tooltip={$noWeb3Provider$ && 'You need to connect your wallet'}
  disabled={$isUnavailable$}
  isLoading={$isLoading$}
  job={importEnga}
  className="m-0 text-sm md:text-xs flex gap-2 items-center"
  let:isLoading>
  <SvgIcon height="1.1rem" width="1.1rem" Icon={MetamaskIcon} dontFill />
  <span>{$__$?.web3Provider.importEnga}</span>
</Button>
