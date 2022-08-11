import { Contract, Signer } from 'ethers'
import _ from 'lodash'
import { isObservable, Observable, of, switchMap } from 'rxjs'
import { safeSwitchMap } from '../safe-throw'

type ResolvedAddress<T> = T extends Signer | Contract | string ? string : T

//DEBUG: test all case scenarios
export function resolveAddress<T>(
  subject: T,
): Observable<T extends Observable<infer S> ? ResolvedAddress<S> : ResolvedAddress<T>> {
  return (
    _.isString(subject)
      ? of(subject)
      : Signer.isSigner(subject)
      ? of(0).pipe(safeSwitchMap(() => subject.getAddress(), { project: null }))
      : subject instanceof Contract
      ? of(subject.address)
      : isObservable(subject)
      ? subject.pipe(switchMap(x => resolveAddress(x)))
      : of(subject)
  ) as any
}
