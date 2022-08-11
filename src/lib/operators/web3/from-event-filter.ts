import { wrapWith } from '$lib/utils/zone'
import type { TypedEventFilter, TypedListener } from 'engaland_fundraising_app/typechain/common'
import type { Contract } from 'ethers'
import { fromEventPattern, Observable } from 'rxjs'
export function fromEventFilter<
  T extends Contract,
  _EventArgsArray extends unknown[],
  _EventArgsObject,
>(
  contract: T,
  filter: TypedEventFilter<_EventArgsArray, _EventArgsObject>,
): Observable<Parameters<TypedListener<_EventArgsArray, _EventArgsObject>>> {
  const zone = Zone.current
  return fromEventPattern(
    handler => contract.on(filter, wrapWith(zone, handler)),
    handler => contract.off(filter, wrapWith(zone, handler)),
  )
}
