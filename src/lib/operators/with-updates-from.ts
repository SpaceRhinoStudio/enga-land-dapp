import _ from 'lodash'
import { map, mergeMap, Observable, type OperatorFunction, switchMap } from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'

export function withUpdatesFrom<T, R>(
  sourceOrMapper: ((input: T) => Observable<R>) | Observable<R>,
): OperatorFunction<T, [T, R]> {
  return source =>
    source.pipe(mergeMap(x => unLazy(sourceOrMapper, x).pipe(map(res => [x, res] as [T, R]))))
}

export function withUpdatesUntilChanged<T, R>(
  sourceOrMapper: ((input: T) => Observable<R>) | Observable<R>,
): OperatorFunction<T, [T, R]> {
  return source =>
    source.pipe(switchMap(x => unLazy(sourceOrMapper, x).pipe(map(res => [x, res] as [T, R]))))
}
