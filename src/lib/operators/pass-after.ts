import _ from 'lodash'
import {
  map,
  mergeMap,
  type MonoTypeOperatorFunction,
  of,
  type OperatorFunction,
  pipe,
  tap,
  ReplaySubject,
  dematerialize,
  materialize,
  ignoreElements,
  mergeWith,
  ObservableNotification,
  ObservableInput,
  switchMap,
  exhaustMap,
  from,
} from 'rxjs'

/**@deprecated use `waitForJobSwitch` or `waitForJobExhaust` instead */
export function passAfter<T, M, R>(
  operator: OperatorFunction<T, M>,
  project: (value: M, source: T, index: number) => R,
): OperatorFunction<T, R>
/**@deprecated use `waitForJobSwitch` or `waitForJobExhaust` instead */
export function passAfter<T, M>(operator: OperatorFunction<T, M>): MonoTypeOperatorFunction<T>
/**@deprecated use `waitForJobSwitch` or `waitForJobExhaust` instead */
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

//TODO: write unit test for this
/**@notice may only be used in very specific conditions where the operator needs direct access to stream */
export function waitForOpStream<T>(op: OperatorFunction<T, unknown>): MonoTypeOperatorFunction<T> {
  const copy$ = new ReplaySubject<T>(1)
  const notifications: ObservableNotification<T>[] = []
  return pipe(
    // observeOn(asapScheduler),
    materialize(),
    tap(x => {
      notifications.push(x)
    }),
    dematerialize(),
    op,
    tap(() => {
      notifications.forEach(notification => {
        if (notification.kind === 'C') {
          copy$.complete()
        } else if (notification.kind === 'E') {
          copy$.error(notification.error)
        } else if (notification.kind === 'N') {
          copy$.next(notification.value)
        }
      })
      notifications.length = 0
    }),
    ignoreElements(),
    mergeWith(copy$),
  )
}

export function waitForJobSwitch<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project: (value: M, source: T, index: number) => R,
): OperatorFunction<T, R>
export function waitForJobSwitch<T>(
  job: (value: T) => ObservableInput<unknown>,
): MonoTypeOperatorFunction<T>
export function waitForJobSwitch<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project?: (value: M, source: T, index: number) => R,
): OperatorFunction<T, T | R> {
  return pipe(
    switchMap(x =>
      from(job(x)).pipe(
        map((result, index) => (_.isFunction(project) ? project(result, x, index) : x)),
      ),
    ),
  )
}

export function waitForJobExhaust<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project: (value: M, source: T, index: number) => R,
): OperatorFunction<T, R>
export function waitForJobExhaust<T>(
  job: (value: T) => ObservableInput<unknown>,
): MonoTypeOperatorFunction<T>
export function waitForJobExhaust<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project?: (value: M, source: T, index: number) => R,
): OperatorFunction<T, T | R> {
  return pipe(
    exhaustMap(x =>
      from(job(x)).pipe(
        map((result, index) => (_.isFunction(project) ? project(result, x, index) : x)),
      ),
    ),
  )
}

//DEBUG: write tests
export function waitForJobConcat<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project: (value: M, source: T, index: number) => R,
): OperatorFunction<T, R>
export function waitForJobConcat<T>(
  job: (value: T) => ObservableInput<unknown>,
): MonoTypeOperatorFunction<T>
export function waitForJobConcat<T, M = unknown, R = T>(
  job: (value: T) => ObservableInput<M>,
  project?: (value: M, source: T, index: number) => R,
): OperatorFunction<T, T | R> {
  return pipe(
    exhaustMap(x =>
      from(job(x)).pipe(
        map((result, index) => (_.isFunction(project) ? project(result, x, index) : x)),
      ),
    ),
  )
}
