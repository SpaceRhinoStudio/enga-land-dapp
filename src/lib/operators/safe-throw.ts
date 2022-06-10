import _ from 'lodash'
import {
  catchError,
  EMPTY,
  mergeMap,
  type MonoTypeOperatorFunction,
  Observable,
  type ObservableInput,
  type ObservedValueOf,
  of,
  type OperatorFunction,
  throwError,
  type TruthyTypesOf,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { type BooleanObservableInputConstructor, filterBy } from './filter-by'

export function safeThrowMergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  concurrent?: number,
): OperatorFunction<T, ObservedValueOf<O>>

export function safeThrowMergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O | undefined,
  concurrent?: number,
): OperatorFunction<T, ObservedValueOf<O> | undefined>

export function safeThrowMergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O | undefined,
  concurrent?: number,
): OperatorFunction<T, ObservedValueOf<O> | undefined> {
  return source$ =>
    source$.pipe(
      mergeMap((...args) => {
        try {
          return project(...args) ?? of(undefined)
        } catch (e) {
          console.log('safeThrowMergeMap:')
          console.warn(e)
          return throwError(() => e)
        }
      }),
    )
}

export function safeThrowMap<T, R>(
  project: (value: T, index: number) => R,
): OperatorFunction<T, R> {
  return source$ =>
    source$.pipe(
      mergeMap((...args) => {
        try {
          return of(project(...args))
        } catch (e) {
          console.log('safeThrowMap:')
          console.warn(e)
          return throwError(() => e)
        }
      }),
    )
}

export function safeThrowCatchError<T, O extends ObservableInput<any>>(
  selector: (err: any, caught: Observable<T>) => O,
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return source$ =>
    source$.pipe(
      catchError((...args) => {
        try {
          return selector(...args)
        } catch (e) {
          console.log('safeThrowCatchError:')
          console.warn(e)
          return throwError(() => e)
        }
      }),
    )
}

export function safeThrowFilter<T, S extends T>(
  predicate: (value: T) => value is S,
): OperatorFunction<T, S>

export function safeThrowFilter<T>(
  predicate: BooleanConstructor,
): OperatorFunction<T, TruthyTypesOf<T>>

export function safeThrowFilter<T>(predicate: (value: T) => boolean): MonoTypeOperatorFunction<T>

export function safeThrowFilter<T>(predicate: (value: T) => boolean): MonoTypeOperatorFunction<T> {
  return source$ =>
    source$.pipe(
      filterBy(value => {
        try {
          return of(predicate(value))
        } catch (e) {
          console.log('safeThrowFilter:')
          console.warn(e)
          return throwError(() => e)
        }
      }),
    )
}

export function safeThrowFilterBy<T, S>(
  predicate: (value: T) => ObservableInput<typeof value extends S ? true : false>,
  falseIfThrown?: boolean,
): OperatorFunction<T, S>

export function safeThrowFilterBy<T>(
  predicate: BooleanObservableInputConstructor,
  falseIfThrown?: boolean,
): OperatorFunction<T, TruthyTypesOf<T>>

export function safeThrowFilterBy<T>(
  predicate: (value: T) => ObservableInput<boolean>,
  falseIfThrown?: boolean,
): MonoTypeOperatorFunction<T>

export function safeThrowFilterBy<T>(
  predicate: (source: T) => ObservableInput<boolean>,
  falseIfThrown = false,
): MonoTypeOperatorFunction<T> {
  return source =>
    source.pipe(
      filterBy(x => {
        try {
          return predicate(x)
        } catch (e) {
          console.log('safeThrowFilterBy:')
          console.warn(e)
          if (falseIfThrown) {
            return of(false)
          }
          return throwError(() => e)
        }
      }),
    )
}

export function filterErrors<T, R>(operator: OperatorFunction<T, R>): OperatorFunction<T, R> {
  return x$ =>
    x$.pipe(
      mergeMap(x =>
        of(x).pipe(
          operator,
          catchError(e => {
            console.log('filterErrors:')
            console.warn(e)
            return EMPTY
          }),
        ),
      ),
    )
}

export function mapErrors<T, R, E>(
  operator: OperatorFunction<T, R>,
  placeholder: E | ((source: T) => E),
): OperatorFunction<T, R | E> {
  return x$ =>
    x$.pipe(
      mergeMap(x =>
        of(x).pipe(
          operator,
          catchError(e => {
            console.log('mapErrors:')
            console.warn(e)
            return of(unLazy(placeholder, x))
          }),
        ),
      ),
    )
}
