import { keysOf } from './type-safe'

export function isEnumMember<T>(x: unknown, source: Record<string | number, T>): x is T {
  return keysOf(source).findIndex(e => e === x) !== -1
}
