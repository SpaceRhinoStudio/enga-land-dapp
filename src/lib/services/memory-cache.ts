import _ from 'lodash'
import { ReplaySubject } from 'rxjs'
import type { LazyEval } from '$lib/types'
import { unLazy } from '$lib/shared/utils/un-lazy'

const memoryCacheEmptySentinel = Symbol('memoryCacheEmptySentinel')

export class MemoryCache {
  private storage: { [key: string]: unknown } = {}
  private observables: { [key: string]: ReplaySubject<unknown> } = {}

  constructor() {
    //
  }

  private _store(key: string, value: unknown): void {
    this.storage[key] = value
  }

  /**
   * @description passing a function as a way to patch the current value might result in unexpected results if there are more than one parts of the code that are simultaneously doing the same, you should use the stream-cache instead, as it handles such situations properly.
   */
  public store<T = unknown>(key: string, value: ((prev: T | undefined) => T) | T): void {
    this.observe<T>(key).next(
      _.isFunction(value)
        ? value(
            (() => {
              try {
                return this.get<T>(key)
              } catch {
                return undefined
              }
            })(),
          )
        : value,
    )
  }

  public get<T>(key: string): T {
    if (!this.has(key)) {
      throw new Error(`key ${key} doesn't exist in MemoryCache`)
    }

    return this.storage[key] as T
  }

  public getDefault<T>(key: string, init: LazyEval<T>): T {
    if (this.has(key)) {
      return this.storage[key] as T
    }

    this.store(key, unLazy(init))
    return unLazy(init)
  }

  public remove(key: string): void {
    delete this.storage[key]
  }

  public has(key: string): boolean {
    return key in this.storage
  }

  //DEBUG: test new changes
  public observe<T>(
    key: string,
    initializer: LazyEval<T> | typeof memoryCacheEmptySentinel = memoryCacheEmptySentinel,
  ): ReplaySubject<T> {
    if (!(key in this.observables)) {
      this.observables[key] = new ReplaySubject(1)
      const observable = this.observables[key]!
      try {
        observable.next(
          initializer !== memoryCacheEmptySentinel
            ? this.getDefault<T>(key, initializer)
            : this.get<T>(key),
        )
      } catch {
        //ignore
      }
      observable.subscribe({
        next: value => this._store(key, value),
      })
    }
    return this.observables[key]! as ReplaySubject<T>
  }
}
