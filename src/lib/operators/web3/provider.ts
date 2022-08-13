import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import { map, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { Option, Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { switchSome } from '../pass-undefined'

export const mapToProviderMeta: OperatorFunction<
  Option<Web3ProviderId>,
  Option<Web3ProviderMetadata>
> = pipe(
  switchSome(
    switchMap(id =>
      Web3ProvidersMeta$.pipe(map(providerMeta => providerMeta.find(x => x.id === id))),
    ),
  ),
)
