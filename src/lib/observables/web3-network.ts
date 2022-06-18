import { config } from '$lib/configs'
import { Network } from '$lib/configs/web3'
import { localCache } from '$lib/contexts/local-cache'
import { controlStreamPayload } from '$lib/shared/operators/control-stream-payload'
import { isEnumMember } from '$lib/utils/enum'
import { distinctUntilChanged, filter, map, ReplaySubject, Subject } from 'rxjs'

export const selectedNetwork$ = new ReplaySubject<Network>(1)

export const selectedNetworkController$ = new Subject<Partial<{ Set: string }>>()

selectedNetworkController$
  .pipe(
    controlStreamPayload('Set'),
    filter(x => !isEnumMember(x, Network)),
    map(x => x as Network),
    distinctUntilChanged(),
  )
  .subscribe(selectedNetwork$)

selectedNetwork$
  .pipe(distinctUntilChanged())
  .subscribe(localCache.observe<Network>(config.SelectedNetworkStorageKey, Network.Polygon))

localCache
  .observe<Network>(config.SelectedNetworkStorageKey, Network.Polygon)
  .pipe(
    distinctUntilChanged(),
    map(x => ({ Set: x })),
  )
  .subscribe(selectedNetworkController$)
