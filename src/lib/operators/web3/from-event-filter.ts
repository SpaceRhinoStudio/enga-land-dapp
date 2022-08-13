import { wrapWith } from '$lib/utils/zone'
import type { TypedEventFilter, TypedListener } from 'engaland_fundraising_app/typechain/common'
import type { Contract } from 'ethers'
import { Observable } from 'rxjs'
export function fromEventFilter<
  T extends Contract,
  _EventArgsArray extends unknown[],
  _EventArgsObject,
>(
  contract: T,
  filter: TypedEventFilter<_EventArgsArray, _EventArgsObject>,
): Observable<Parameters<TypedListener<_EventArgsArray, _EventArgsObject>>> {
  const zone = Zone.current
  return new Observable(subscriber => {
    const handler = wrapWith(zone, (...e: any[]) => subscriber.next(e.length === 1 ? e[0] : e))
    contract.on(filter, handler)
    return () => contract.off(filter, handler)
  })
}
