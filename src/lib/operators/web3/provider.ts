import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import { map, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { Nil, Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { passNil } from '../pass-undefined'

export const mapToProviderMeta: OperatorFunction<Web3ProviderId | Nil, Web3ProviderMetadata | Nil> =
  pipe(passNil(switchMap(id => Web3ProvidersMeta$.pipe(map(providerMeta => providerMeta[id])))))

export const isProviderIdAvailable: OperatorFunction<Web3ProviderId | Nil, boolean> = pipe(
  mapToProviderMeta,
  map(x => !!x),
)
