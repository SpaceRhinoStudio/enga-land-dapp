import { map, type OperatorFunction, switchMap, from, ObservableInput, pipe } from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
export function combineLatestSwitchMap<T, R>(
  sourceOrProject: (input: T) => ObservableInput<R>,
): OperatorFunction<T, [T, R]> {
  return pipe(switchMap(x => from(unLazy(sourceOrProject, x)).pipe(map(res => [x, res] as [T, R]))))
}
