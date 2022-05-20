import {
  catchError,
  EMPTY,
  filter,
  Observable,
  type ObservableInput,
  type ObservedValueOf,
  type OperatorFunction,
  throwError,
} from 'rxjs'
import { noSentinel } from '$lib/utils/no-sentinel-or-undefined'

export function catchAndIgnoreAlreadyInProgressError<T, O extends ObservableInput<unknown>>(
  selector: (err: unknown, caught: Observable<T>) => O,
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return source$ =>
    source$.pipe(
      catchError((...args) => (args[0].code === -32002 ? EMPTY : throwError(() => args[0]))),
      filter(noSentinel),
      catchError(selector),
    )
}

export function safeCatchAndIgnoreAlreadyInProgressError<T, O extends ObservableInput<unknown>>(
  selector: (err: unknown, caught: Observable<T>) => O,
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return source$ =>
    source$.pipe(
      catchError((...args) => (args[0].code === -32002 ? EMPTY : throwError(() => args[0]))),
      filter(noSentinel),
      catchError((...args) => {
        try {
          return selector(...args)
        } catch (e) {
          return throwError(() => e)
        }
      }),
    )
}
