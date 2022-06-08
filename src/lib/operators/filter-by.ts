import {
  filter,
  from,
  identity,
  map,
  mergeMap,
  type MonoTypeOperatorFunction,
  type ObservableInput,
  type OperatorFunction,
  take,
  type TruthyTypesOf,
  switchMap,
  pipe,
} from 'rxjs'

export interface BooleanObservableInputConstructor {
  // eslint-disable-next-line @typescript-eslint/ban-types
  new (value?: any): ObservableInput<Boolean>
  <T>(value?: T): ObservableInput<boolean>
  readonly prototype: ObservableInput<boolean>
}

export function filterBy<T, S>(
  predicate: (value: T) => ObservableInput<typeof value extends S ? true : false>,
): OperatorFunction<T, S>

export function filterBy<T>(
  predicate: BooleanObservableInputConstructor,
): OperatorFunction<T, TruthyTypesOf<T>>

export function filterBy<T>(
  predicate: (value: T) => ObservableInput<boolean>,
): MonoTypeOperatorFunction<T>

export function filterBy<T>(
  predicate: (source: T) => ObservableInput<boolean>,
): MonoTypeOperatorFunction<T> {
  return switchMap(x =>
    from(predicate(x)).pipe(
      take(1),
      filter(identity),
      map(() => x),
    ),
  )
}
