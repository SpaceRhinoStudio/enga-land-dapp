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
  switchMap,
  from,
  isObservable,
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
          console.debug('safeThrowMergeMap:')
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
          console.debug('safeThrowMap:')
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
          console.debug('safeThrowCatchError:')
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
          console.debug('safeThrowFilter:')
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
          console.debug('safeThrowFilterBy:')
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
            console.debug('filterErrors:')
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
            console.debug('mapErrors:')
            console.warn(e)
            return of(unLazy(placeholder, x))
          }),
        ),
      ),
    )
}

type SafeMapOptions = { silent?: boolean }
type SafeMapErrorProject<T, R> = {
  project: ((error: unknown, value: T, index: number) => R | Observable<R>) | R
}

function safeMapCatch<T, R = T>(
  error: unknown,
  options: (SafeMapOptions & Partial<SafeMapErrorProject<T, R>>) | undefined,
  ...args: [T, number]
): Observable<R> {
  if (!options?.silent) {
    console.warn(error)
  }
  if (!_.isUndefined(options) && 'project' in options) {
    if (_.isFunction(options.project)) {
      const res = options.project(error, ...args)
      return isObservable(res) ? res : of(res)
    }
    return of(options.project)
  }
  return EMPTY
}

export function safeSwitchMap<T, O, R>(
  project: (value: T, index: number) => ObservableInput<O>,
  options: SafeMapErrorProject<T, R> & SafeMapOptions,
): OperatorFunction<T, R | O>
export function safeSwitchMap<T, O>(
  project: (value: T, index: number) => ObservableInput<O>,
  options?: SafeMapOptions,
): OperatorFunction<T, O>
export function safeSwitchMap<T, O, R>(
  project: (value: T, index: number) => ObservableInput<O>,
  options?: SafeMapOptions & Partial<SafeMapErrorProject<T, R>>,
): OperatorFunction<T, O | R> {
  return switchMap((...args) => {
    try {
      return from(project(...args)).pipe(
        catchError(e => {
          return safeMapCatch(e, options, ...args)
        }),
      )
    } catch (e) {
      return safeMapCatch(e, options, ...args)
    }
  })
}

export function safeMap<T, O, R>(
  project: (value: T, index: number) => O,
  options: SafeMapErrorProject<T, R> & SafeMapOptions,
): OperatorFunction<T, R | O>
export function safeMap<T, O>(
  project: (value: T, index: number) => O,
  options?: SafeMapOptions,
): OperatorFunction<T, O>
export function safeMap<T, O, R>(
  project: (value: T, index: number) => R,
  options?: SafeMapOptions & Partial<SafeMapErrorProject<T, R>>,
): OperatorFunction<T, O | R> {
  return safeSwitchMap((...args) => of(project(...args)), options)
}
