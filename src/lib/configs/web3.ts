import { Web3Error } from '$lib/classes/web3-error'
import _ from 'lodash'
import { Window$ } from '$lib/shared/observables/window'
import { map, Observable } from 'rxjs'
import type { Web3ProviderId } from '$lib/types'
import type { Network as EthersNetwork } from '@ethersproject/networks'
import type { providers } from 'ethers'

export enum Network {
  BSCMainnet = 'bsc',
  BSCTestnet = 'bscTestnet',
  Local = 'localhost',
  Rinkeby = 'rinkeby',
  Polygon = 'polygon',
  Mumbai = 'polygonMumbai',
  Goerli = 'goerli',
}

function providerNotFoundErrorFactory() {
  return new Web3Error('E0x04 selected provider is not available')
}

const Web3Providers: {
  [providerKey in Web3ProviderId]: {
    id: Web3ProviderId
    provider$: Observable<providers.ExternalProvider | undefined>
  }
} = {
  metamask: {
    id: 'metamask',
    provider$: Window$.pipe(
      map(win => {
        const eth = _.get(win, 'ethereum') as providers.ExternalProvider
        if (eth?.isMetaMask) {
          return eth
        }
        return undefined
      }),
    ),
  },
  binanceChain: {
    id: 'binanceChain',
    provider$: Window$.pipe(
      map(win => _.get(win, 'BinanceChain') as providers.ExternalProvider),
      map(x => (!_.isFunction(_.get(x, 'off')) ? { ...x, off: _.noop } : x)),
    ),
  },
  trust: {
    id: 'trust',
    provider$: Window$.pipe(
      map(win => {
        const eth = _.get(win, 'ethereum') as providers.ExternalProvider & {
          isTrust: boolean | undefined
        }
        if (eth?.isTrust) {
          return eth
        }
        return undefined
      }),
    ),
  },
  safePal: {
    id: 'safePal',
    provider$: Window$.pipe(
      map(win => {
        const eth = _.get(win, 'ethereum') as providers.ExternalProvider & {
          isSafePal: boolean | undefined
        }
        if (eth?.isSafePal) {
          return eth
        }
        return undefined
      }),
    ),
  },
}

const endpoints: { [network in Network]: string[] } = {
  [Network.BSCMainnet]: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.ninicoin.io',
    'https://bsc-dataseed2.defibit.io',
    'https://bsc-dataseed3.defibit.io',
    'https://bsc-dataseed4.defibit.io',
    'https://bsc-dataseed2.ninicoin.io',
    'https://bsc-dataseed3.ninicoin.io',
    'https://bsc-dataseed4.ninicoin.io',
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed3.binance.org',
    'https://bsc-dataseed4.binance.org',
  ],
  [Network.BSCTestnet]: [
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    // 'https://data-seed-prebsc-2-s1.binance.org:8545/',
    // 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    // 'https://data-seed-prebsc-2-s2.binance.org:8545/',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s3.binance.org:8545/',
  ],
  [Network.Local]: ['http://127.0.0.1:8545'],
  [Network.Rinkeby]: [
    'https://rpc.ankr.com/eth_rinkeby',
    'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://rinkeby.infura.io/v3',
  ],
  [Network.Polygon]: [
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.quiknode.pro',
    'https://matic-mainnet-full-rpc.bwarelabs.com',
    'https://rpc.ankr.com/polygon',
    'https://polygonapi.terminet.io/rpc',
    'https://rpc-mainnet.maticvigil.com',
    'https://poly-rpc.gateway.pokt.network',
    'https://polygon-mainnet.public.blastapi.io',
  ],
  [Network.Mumbai]: [
    'https://matic-mumbai.chainstacklabs.com',
    'https://matic-testnet-archive-rpc.bwarelabs.com',
    'https://rpc.ankr.com/polygon_mumbai',
    'https://rpc-mumbai.maticvigil.com',
    'https://polygontestapi.terminet.io/rpc',
  ],
  [Network.Goerli]: [
    'https://rpc.ankr.com/eth_goerli',
    'https://rpc.goerli.mudit.blog',
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://goerli.infura.io/v3/',
  ],
}

const Chains: {
  [key in Network]: {
    id: number
    network: EthersNetwork
    isLive: boolean
    config: {
      chainName: string
      chainId: string
      nativeCurrency: {
        name: string
        symbol: string
        decimals: number
      }
      rpcUrls: string[]
      blockExplorerUrls?: string[]
    }
  }
} = {
  [Network.Local]: {
    id: 1337,
    isLive: false,
    network: {
      chainId: 1337,
      name: Network.Local,
    },
    config: {
      chainId: `0x${(1337).toString(16)}`,
      chainName: 'Localhost',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.Local],
    },
  },
  [Network.Polygon]: {
    id: 137,
    isLive: true,
    network: {
      chainId: 137,
      name: Network.Polygon,
    },
    config: {
      chainId: `0x${(137).toString(16)}`,
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.Polygon],
      blockExplorerUrls: ['https://polygonscan.com/'],
    },
  },
  [Network.Mumbai]: {
    id: 80001,
    isLive: false,
    network: {
      chainId: 80001,
      name: Network.Mumbai,
    },
    config: {
      chainId: `0x${(80001).toString(16)}`,
      chainName: 'Polygon Mumbai Testnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.Mumbai],
      blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    },
  },
  [Network.Goerli]: {
    id: 5,
    isLive: false,
    network: {
      chainId: 5,
      name: Network.Goerli,
    },
    config: {
      chainId: `0x${(5).toString(16)}`,
      chainName: 'Goerli',
      nativeCurrency: {
        name: 'Goerli Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.Goerli],
      blockExplorerUrls: ['https://goerli.etherscan.io/'],
    },
  },
  [Network.Rinkeby]: {
    id: 4,
    isLive: false,
    network: {
      chainId: 4,
      name: Network.Rinkeby,
    },
    config: {
      chainId: `0x${(4).toString(16)}`,
      chainName: 'Rinkeby',
      nativeCurrency: {
        name: 'Rinkeby Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.Rinkeby],
      blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
    },
  },
  [Network.BSCMainnet]: {
    id: 56,
    isLive: true,
    network: {
      chainId: 56,
      name: Network.BSCMainnet,
    },
    config: {
      chainId: `0x${(56).toString(16)}`,
      chainName: 'BSC Mainnet',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'bnb',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.BSCMainnet],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
  },
  [Network.BSCTestnet]: {
    id: 97,
    isLive: false,
    network: {
      chainId: 97,
      name: Network.BSCTestnet,
    },
    config: {
      chainId: `0x${(97).toString(16)}`,
      chainName: 'BSC Testnet',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'bnb',
        decimals: 18,
      },
      rpcUrls: endpoints[Network.BSCTestnet],
      blockExplorerUrls: ['https://testnet.bscscan.com/'],
    },
  },
}

export const web3Config = {
  Web3Providers,
  Chains,
  SelectedNetworkStorageKey: 'selected-web3-network',
  CustomEndpoints: endpoints,
  BscScanApiKey: undefined,
  txFinalityBlocks: 15,
  PPM: 1_000_000,
  apiAddress: 'https://enga-cache.aboosakamod.money',
}
