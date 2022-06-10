<script lang="ts">
  import Button from './Button.svelte'
  import { importEnga } from './helpers/import-enga'
  import SvgIcon from './shared/SVGIcon.svelte'
  import MetamaskIcon from '../assets/wallet-providers/metamask-logo.svg'
  import { __$ } from './shared/locales'
</script>

<Button job={importEnga} className="m-0 text-sm md:text-xs flex gap-2 items-center">
  <SvgIcon height="1.1rem" width="1.1rem" Icon={MetamaskIcon} dontFill />
  <span>{$__$?.web3Provider.importEnga}</span>
</Button>
