import { map, MonoTypeOperatorFunction } from 'rxjs'

export function tapWithIndex<T>(
  cb: (value: T, index: number) => void,
): MonoTypeOperatorFunction<T> {
  return map((val, index) => {
    cb(val, index)
    return val
  })
}
