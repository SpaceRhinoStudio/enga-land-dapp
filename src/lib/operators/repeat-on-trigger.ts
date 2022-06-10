import _ from 'lodash'
import {
  EMPTY,
  map,
  type MonoTypeOperatorFunction,
  Observable,
  pipe,
  repeat,
  startWith,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { withUpdatesFrom, withUpdatesUntilChanged } from './with-updates-from'

export function repeatOnTrigger<T>(observable: Observable<unknown>): MonoTypeOperatorFunction<T> {
  return source$ =>
    source$.pipe(
      repeat({
        delay: count => (count === 0 ? observable : EMPTY),
      }),
    )
}

export function reEmitOnTrigger<T>(
  sourceOrProject: ((input: T) => Observable<unknown>) | Observable<unknown>,
): MonoTypeOperatorFunction<T> {
  return pipe(
    withUpdatesFrom(x => unLazy(sourceOrProject, x).pipe(startWith(undefined))),
    map(([x]) => x),
  )
}

export function reEmitUntilChanged<T>(
  sourceOrProject: ((input: T) => Observable<unknown>) | Observable<unknown>,
): MonoTypeOperatorFunction<T> {
  return pipe(
    withUpdatesUntilChanged(x => unLazy(sourceOrProject, x).pipe(startWith(undefined))),
    map(([x]) => x),
  )
}
