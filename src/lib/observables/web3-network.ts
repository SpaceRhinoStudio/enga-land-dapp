import { config } from '$lib/configs'
import { localCache } from '$lib/contexts/local-cache'
import { controlStreamPayload } from '$lib/shared/operators/control-stream-payload'
import { isEnumMember } from '$lib/utils/enum'
import { distinctUntilChanged, filter, map, ReplaySubject, Subject, tap } from 'rxjs'

import '../../index'
import { getSyncSubjectValue } from '$lib/utils/get-subject-value'
import { Network, Option } from '$lib/types'
import _ from 'lodash'

export const selectedNetwork$ = new ReplaySubject<Option<Network>>(1)

export const defaultNetwork = Network.Polygon

const storage = localCache.observe<Option<Network>>(
  config.SelectedNetworkStorageKey,
  defaultNetwork,
)

export const networkController$ = new Subject<
  Partial<{ Set: Option<Network>; Request: Option<string> }>
>()

const isValidNetwork = isEnumMember(Network)

networkController$
  .pipe(
    controlStreamPayload('Request'),
    map(x => (isValidNetwork(x) ? x : null)),
    map(n => ({ Set: n })),
  )
  .subscribe(networkController$)

networkController$.pipe(controlStreamPayload('Set')).subscribe(selectedNetwork$)

selectedNetwork$.pipe(distinctUntilChanged()).subscribe(storage)

storage
  .pipe(
    distinctUntilChanged(),
    filter(x => x !== getSyncSubjectValue(selectedNetwork$)),
    distinctUntilChanged(),
    map(x => ({ Request: x })),
  )
  .subscribe(networkController$)
