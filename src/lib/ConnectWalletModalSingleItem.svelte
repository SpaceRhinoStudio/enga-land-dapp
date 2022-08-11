<script lang="ts" context="module">
  const zone = Zone.current.fork({ name: 'UserConnectWalletModal' })
</script>

<script lang="ts">
  import { filter, firstValueFrom, tap } from 'rxjs'
  import Button from './shared/Button.svelte'
  import { config } from './configs'
  import { web3ProviderIdController$, signerAddress$ } from './observables/selected-web3-provider'
  import SvgIcon from './shared/SVGIcon.svelte'
  import type { Web3ProviderId } from './types'
  import binanceChain from '../assets/wallet-providers/binance-logo.svg'
  import metamask from '../assets/wallet-providers/metamask-logo.svg'
  import safePal from '../assets/wallet-providers/safe-pal-logo.svg'
  import trust from '../assets/wallet-providers/trust-wallet-logo.svg'
  import walletConnect from '../assets/wallet-providers/walletconnect.svg'
  import { __$ } from './shared/locales'
  import cn from 'classnames'
  import _ from 'lodash'
  import { noUndefined } from './shared/utils/no-sentinel-or-undefined'

  const connectWalletModalAssetsMap: { [key in Web3ProviderId]: any } = {
    binanceChain,
    metamask,
    safePal,
    trust,
    walletConnect,
  }

  export let loading: string | null
  export let id: Web3ProviderId
  export let requestExit: () => void
  let provider$ = config.Web3Providers[id].provider$

  const handleConnect = () =>
    zone.run(() => {
      loading = id
      const res = firstValueFrom(
        signerAddress$.pipe(
          filter((x, i) => (i === 0 && _.isNil(x) ? false : true)),
          filter(noUndefined),
          tap(x => {
            loading = null
            !_.isEmpty(x) && requestExit()
          }),
        ),
      )
      web3ProviderIdController$.next({ Request: id })
      return res
    })
</script>

<Button
  className="flex flex-col items-center !border-transparent disabled:!bg-transparent bg-transparent text-text-secondary px-2 py-2 m-0 text-sm w-full h-full"
  disabled={!!loading || !$provider$}
  job={handleConnect}>
  <SvgIcon
    width={'2.5rem'}
    height={'2.5rem'}
    Icon={connectWalletModalAssetsMap[id]}
    dontFill
    className={cn(
      'h-20',
      'sm:w-20',
      'object-contain',
      'mb-3',
      'transition-all',
      'select-none',
      loading === id ? 'bg-primary-600' : 'bg-primary-600 bg-opacity-80',
      'backdrop-blur-md',
      'rounded-lg',
      'p-5',
      'w-full',
      ((loading && loading !== id) || !$provider$) && 'opacity-20',
    )} />
  <div>{$__$?.walletProviders[id]}</div>
</Button>
