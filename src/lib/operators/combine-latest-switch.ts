import { map, type OperatorFunction, switchMap, from, ObservableInput, pipe } from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { ShallowCons } from '$lib/types'
import { castArray } from '$lib/shared/utils/type-safe'

//DEBUG: write tests
export function combineLatestSwitchMap<T, R>(
  project: (input: T) => ObservableInput<R>,
): OperatorFunction<T, ShallowCons<T, R>> {
  return pipe(
    switchMap(x =>
      from(unLazy(project, x)).pipe(map(res => [...castArray(x), ...castArray(res)] as const)),
    ),
  )
}
