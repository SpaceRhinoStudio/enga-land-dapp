<script lang="ts">
  import { auditTime, filter, firstValueFrom, withLatestFrom } from 'rxjs'
  import Button from './shared/Button.svelte'
  import { config } from './configs'
  import { waitFor } from './helpers/wait-for'
  import {
    IsConnectingToSelectedProvider$,
    SelectedWeb3ProviderIdController$,
    signerAddress$,
  } from './observables/selected-web3-provider'
  import SvgIcon from './shared/SVGIcon.svelte'
  import type { Web3ProviderId } from './types'
  import binanceChain from '../assets/wallet-providers/binance-logo.svg'
  import metamask from '../assets/wallet-providers/metamask-logo.svg'
  import safePal from '../assets/wallet-providers/safe-pal-logo.svg'
  import trust from '../assets/wallet-providers/trust-wallet-logo.svg'
  import { __$ } from './shared/locales'

  const connectWalletModalAssetsMap: { [key in Web3ProviderId]: any } = {
    binanceChain,
    metamask,
    safePal,
    trust,
  }

  export let loading: string | null
  export let id: Web3ProviderId
  export let requestExit: () => void
  let provider$ = config.Web3Providers[id].provider$
</script>

<Button
  className="flex flex-col items-center border-none disabled:!bg-transparent bg-transparent text-text-secondary px-2 py-2 m-0 text-sm w-1/2 md:w-auto"
  disabled={(loading && loading !== id) || !$provider$}
  isLoading={loading === id}
  job={async () => {
    loading = id
    SelectedWeb3ProviderIdController$.next({ Unset: true })
    await waitFor(100)
    SelectedWeb3ProviderIdController$.next({ Set: id })
    await firstValueFrom(
      IsConnectingToSelectedProvider$.pipe(
        auditTime(1000),
        filter(x => !x),
        withLatestFrom(signerAddress$),
      ),
    ).then(([, x]) => {
      loading = null
      x?.length && requestExit()
    })
  }}>
  <SvgIcon
    width={'2.5rem'}
    height={'2.5rem'}
    Icon={connectWalletModalAssetsMap[id]}
    dontFill
    className={`
        h-20
        md:w-20
        object-contain
        mb-3
        transition-all
        select-none
        bg-[#2e2847]
        rounded-lg
        p-5
        w-full
        ${(loading && loading !== id) || !$provider$ ? 'opacity-20' : ''}
        ${loading === id ? 'opacity-0' : ''}
    `} />
  <div>{$__$?.walletProviders[id]}</div>
</Button>
