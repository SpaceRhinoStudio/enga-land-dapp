import { of, type OperatorFunction, pipe, switchMap } from 'rxjs'

export function pipeIfNot<T, R>(
  predicate: OperatorFunction<T, boolean>,
  project: OperatorFunction<T, R>,
): OperatorFunction<T, T | R> {
  return pipe(
    switchMap(x =>
      of(x).pipe(
        predicate,
        // take(1),
        switchMap(result => (result ? of(x) : of(x).pipe(project))),
      ),
    ),
  )
}
