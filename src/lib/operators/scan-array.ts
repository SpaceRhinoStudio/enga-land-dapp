import { OperatorFunction, pipe, scan } from 'rxjs'

export function toScanArray<T>(): OperatorFunction<T, T[]> {
  return pipe(scan((acc, curr) => [...acc, curr], [] as T[]))
}
