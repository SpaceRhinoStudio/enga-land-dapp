import {
  EMPTY,
  map,
  type MonoTypeOperatorFunction,
  Observable,
  pipe,
  repeat,
  switchMap,
  from,
  ObservableInput,
  startWith,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'

export function repeatOnTrigger<T>(observable: Observable<unknown>): MonoTypeOperatorFunction<T> {
  return source$ =>
    source$.pipe(
      repeat({
        delay: count => (count === 0 ? observable : EMPTY),
      }),
    )
}

//DEBUG: write tests
export function reEvaluateSwitchMap<T>(
  project: (input: T) => ObservableInput<unknown>,
): MonoTypeOperatorFunction<T> {
  return pipe(
    switchMap(x =>
      from(unLazy(project, x)).pipe(
        startWith(undefined),
        map(() => x),
      ),
    ),
  )
}

//DEBUG: write tests
export function reEvaluate<T>(trigger$: Observable<unknown>): MonoTypeOperatorFunction<T> {
  return pipe(
    switchMap(x =>
      trigger$.pipe(
        startWith(undefined),
        map(() => x),
      ),
    ),
  )
}
