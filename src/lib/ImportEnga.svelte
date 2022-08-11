<script lang="ts">
  import Button from './shared/Button.svelte'
  import { importEnga } from './helpers/import-enga'
  import SvgIcon from './shared/SVGIcon.svelte'
  import MetamaskIcon from '../assets/wallet-providers/metamask-logo.svg'
  import { __$ } from './shared/locales'
  import { EngaTokenContract$ } from '../contracts/fundraising-contracts'
  import _ from 'lodash'
  import { debounceTime, filter, map } from 'rxjs'
  import cn from 'classnames'

  const isLoading$ = EngaTokenContract$.pipe(map(_.isUndefined), debounceTime(500))
  const isUnavailable$ = EngaTokenContract$.pipe(map(_.isNull), debounceTime(500))
</script>

<Button
  disabled={$isUnavailable$}
  isLoading={$isLoading$}
  job={importEnga}
  className="m-0 text-sm md:text-xs flex gap-2 items-center"
  let:isLoading>
  <SvgIcon height="1.1rem" width="1.1rem" Icon={MetamaskIcon} dontFill />
  <span>{$__$?.web3Provider.importEnga}</span>
</Button>
