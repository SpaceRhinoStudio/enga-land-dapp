import { map, Observable, OperatorFunction, pipe, switchMap } from 'rxjs'

export function mapIndex<T extends readonly unknown[], I extends keyof Omit<T, keyof unknown[]>, R>(
  index: I,
  project: (value: T[I]) => Observable<R>,
): OperatorFunction<T, { [P in keyof T]: P extends I ? R : T[P] }> {
  return pipe(
    switchMap(tuple =>
      project(tuple[index]).pipe(
        map(resolved => {
          return tuple.map((val, i) => (i == index ? resolved : val)) as unknown as {
            [P in keyof T]: P extends I ? typeof resolved : T[P]
          }
        }),
      ),
    ),
  )
}
