import { map, mergeMap, type MonoTypeOperatorFunction, of, type OperatorFunction, pipe } from 'rxjs'

export function passAfter<T, M, R>(
  operator: OperatorFunction<T, M>,
  project: (value: M, source: T, index: number) => R,
): OperatorFunction<T, R>
export function passAfter<T, M>(operator: OperatorFunction<T, M>): MonoTypeOperatorFunction<T>
export function passAfter<T, M, R>(
  operator: OperatorFunction<T, M>,
  project?: (value: M, source: T, index: number) => R,
): OperatorFunction<T, T | R> {
  return pipe(
    mergeMap(x =>
      of(x).pipe(
        operator,
        map<M, T | R>((res, index) => project?.(res, x, index) ?? x),
      ),
    ),
  )
}
