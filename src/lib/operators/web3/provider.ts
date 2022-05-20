import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import { map, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { passUndefined } from '../pass-undefined'

export const mapToProviderMeta: OperatorFunction<
  Web3ProviderId | undefined,
  Web3ProviderMetadata | undefined
> = pipe(
  passUndefined(switchMap(id => Web3ProvidersMeta$.pipe(map(providerMeta => providerMeta[id])))),
)

export const isProviderIdAvailable: OperatorFunction<Web3ProviderId | undefined, boolean> = pipe(
  mapToProviderMeta,
  map(x => !!x),
)
