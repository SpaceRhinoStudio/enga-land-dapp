import _ from 'lodash'
import { map, mergeMap, Observable, type OperatorFunction, switchMap } from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'

//TODO: replace all references with `combineLatestWith`
/**@deprecated use `combineLatestWith` or `withUpdatesUntilChanged` */
export function withUpdatesFrom<T, R>(
  sourceOrMapper: ((input: T) => Observable<R>) | Observable<R>,
): OperatorFunction<T, [T, R]> {
  return source =>
    source.pipe(mergeMap(x => unLazy(sourceOrMapper, x).pipe(map(res => [x, res] as [T, R]))))
}

//TODO: rename this to something that is close to `combineLatestWith` for clarity
//TODO: replace instances that don't use mapper with `combineLatestWith`
/**@see combineLatestWith */
export function withUpdatesUntilChanged<T, R>(
  sourceOrMapper: ((input: T) => Observable<R>) | Observable<R>,
): OperatorFunction<T, [T, R]> {
  return source =>
    source.pipe(switchMap(x => unLazy(sourceOrMapper, x).pipe(map(res => [x, res] as [T, R]))))
}
