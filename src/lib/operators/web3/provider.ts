import { Web3ProvidersMeta$ } from '$lib/observables/web3-providers/injected-external-provider'
import { map, type OperatorFunction, pipe, switchMap, firstValueFrom, of, tap } from 'rxjs'
import type { Option, Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { switchSome } from '../pass-undefined'
import { Window$ } from '$lib/shared/observables/window'
import { combineLatestSwitchMap } from '../combine-latest-switch'

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

export const clearCache: () => Promise<void> = () =>
  firstValueFrom(
    Window$.pipe(
      combineLatestSwitchMap(win =>
        of([win.localStorage.getItem('debug-id'), win.localStorage.getItem('debug-sent') ?? '[]']),
      ),
      tap(([win]) => win.localStorage.clear()),
      tap(([win, [debugId, logsSent]]) => {
        win.localStorage.setItem('debug-id', debugId!)
        win.localStorage.setItem('debug-sent', logsSent!)
      }),
      tap(([win]) => win.location.reload()),
      map(() => undefined),
    ),
  )
