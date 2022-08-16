import type { AsyncMapper } from '../types'

export function orderedAsyncChainMapFactory(mappers: AsyncMapper[]) {
  return function orderedAsyncChainMapper(value: unknown): Promise<unknown> {
    return mappers.reduce((acc, curr) => acc.then(curr), Promise.resolve(value))
  }
}
