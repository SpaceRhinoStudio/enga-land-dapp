import type { Web3ProviderId } from '$lib/types'

/**@description why object you might ask, because TS won't let you miss a key! */
const Web3ProviderIdTypeSafeKeys: { [key in Web3ProviderId]: string } = {
  metamask: 'metamask',
  binanceChain: 'binanceChain',
  trust: 'trust',
  safePal: 'safePal',
}

export const Web3ProviderIdArray: Web3ProviderId[] = Object.keys(
  Web3ProviderIdTypeSafeKeys,
) as (keyof typeof Web3ProviderIdTypeSafeKeys)[]

/**@description this simply validates if a given web3 provider id is defined in the system */
export function isWeb3ProviderId(id: string): id is Web3ProviderId {
  //@ts-expect-error this is a test to validate type!
  return Web3ProviderIdArray.includes(id)
}
