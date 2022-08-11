import { of, type OperatorFunction, pipe, switchMap, map, groupBy } from 'rxjs'

/**@deprecated please use a simple switchMap */
export function pipeIfNot<T, R>(
  predicate: OperatorFunction<T, boolean>,
  project: OperatorFunction<T, R>,
): OperatorFunction<T, T | R> {
  return pipeIf(
    pipe(
      predicate,
      map(x => !x),
    ),
    project,
  )
}

/**@deprecated please use a simple switchMap */
export function pipeIf<T, R>(
  predicate: OperatorFunction<T, boolean>,
  project: OperatorFunction<T, R>,
): OperatorFunction<T, T | R> {
  return pipe(
    switchMap(x =>
      of(x).pipe(
        predicate,
        switchMap(result => (result ? of(x).pipe(project) : of(x))),
      ),
    ),
  )
}
