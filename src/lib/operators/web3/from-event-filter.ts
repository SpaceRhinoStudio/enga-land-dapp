import { onlineStatus$ } from '$lib/shared/observables/window'
import { wrapWith } from '$lib/utils/zone'
import type { TypedEventFilter, TypedListener } from 'engaland_fundraising_app/typechain/common'
import type { Contract } from 'ethers'
import {
  Observable,
  throttleTime,
  ThrottleConfig,
  SchedulerLike,
  identity,
  catchError,
  timer,
  switchMap,
  filter,
  take,
} from 'rxjs'

export function fromEventFilter<
  T extends Contract,
  _EventArgsArray extends unknown[],
  _EventArgsObject,
>(
  contract: T,
  _filter: TypedEventFilter<_EventArgsArray, _EventArgsObject>,
  throttleConfig?: ThrottleConfig & { duration: number; scheduler?: SchedulerLike },
): Observable<Parameters<TypedListener<_EventArgsArray, _EventArgsObject>>> {
  const zone = Zone.current
  return new Observable<Parameters<TypedListener<_EventArgsArray, _EventArgsObject>>>(
    subscriber => {
      const handler = wrapWith(zone, (...e: any[]) => subscriber.next(e.length === 1 ? e[0] : e))
      contract.on(_filter, handler)
      return () => contract.off(_filter, handler)
    },
  ).pipe(
    throttleConfig
      ? throttleTime(throttleConfig.duration, throttleConfig.scheduler, throttleConfig)
      : identity,
    catchError((_, o) =>
      timer(1000).pipe(
        switchMap(() => onlineStatus$),
        filter(x => x),
        take(1),
        switchMap(() => o),
      ),
    ),
  )
}
