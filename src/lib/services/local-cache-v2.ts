import _ from 'lodash'
import { distinctUntilChanged, filter, from, mergeMap, ReplaySubject, switchMap, tap } from 'rxjs'
import type { AsyncMapper, CacheService, StorageAPI, UnPromise } from '$lib/types'
import { deepMapAsync } from '$lib/utils/deep-map-async'
import { orderedAsyncChainMapFactory } from '$lib/utils/ordered-async-chain-map'
import type { MemoryCache } from './memory-cache'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { wrapWith } from '$lib/utils/zone'
import { isEqual } from '$lib/shared/utils/type-safe'

export class LocalCache implements CacheService {
  private observablesMemoryCacheKey = 'localCacheObservables'

  constructor(
    private storage: StorageAPI,
    private serializers: AsyncMapper[],
    private deserializers: AsyncMapper[],
    private memoryCache: MemoryCache,
  ) {
    if (!this.memoryCache.has(this.observablesMemoryCacheKey)) {
      this.memoryCache.store(this.observablesMemoryCacheKey, {})
    }
  }

  private deserialize<T = unknown>(item: string): Promise<T | UnPromise<T>> {
    return deepMapAsync(
      JSON.parse(item),
      orderedAsyncChainMapFactory(this.deserializers),
    ) as Promise<T | UnPromise<T>>
  }

  private serialize(value: unknown): Promise<string> {
    return deepMapAsync(value, orderedAsyncChainMapFactory(this.serializers)).then(res =>
      JSON.stringify(res),
    )
  }

  public get<T = unknown>(key: string): Promise<T | UnPromise<T>> {
    return this.storage.read(key).then(item => {
      if (_.isNull(item)) {
        throw new Error(`key ${key} doesn't exist in LocalCache`)
      }
      return this.deserialize(item)
    })
  }

  public store(key: string, value: unknown): Promise<void> {
    return this.serialize(value).then(res => this.storage.write(key, res))
  }

  public has(key: string): Promise<boolean> {
    return this.storage.getAllKeys().then(res => res.includes(key))
  }

  public getDefault<T = unknown>(key: string, initializer: T): Promise<T | UnPromise<T>> {
    return this.has(key)
      .then(has => (has ? this.get<T>(key) : undefined))
      .catch(() => undefined)
      .then(res =>
        !_.isUndefined(res) ? res : this.store(key, initializer).then(() => initializer),
      )
  }

  public remove(key: string): Promise<void> {
    return this.storage.delete(key)
  }

  public getAllKeys(): Promise<string[]> {
    return this.storage.getAllKeys()
  }

  public observe<T>(key: string, initializer?: T): ReplaySubject<T | UnPromise<T>>

  public observe<E>(
    key: string,
    initializer: _.Dictionary<E>,
  ): ReplaySubject<_.Dictionary<E | UnPromise<E>>>

  public observe<E>(key: string, initializer: E[]): ReplaySubject<(E | UnPromise<E>)[]>

  public observe<T = unknown>(key: string, initializer?: T): ReplaySubject<T | UnPromise<T>> {
    const observables = this.memoryCache.get<{
      [key: string]: ReplaySubject<T | UnPromise<T>>
    }>(this.observablesMemoryCacheKey)

    if (!(key in observables)) {
      const zone = Zone.current.fork({
        name: 'Init:LocalCache',
        properties: {
          bgColor: '#007605',
        },
      })

      observables[key] = new ReplaySubject<T | UnPromise<T>>(1)
      const observable = observables[key]!

      const promise = (
        _.isUndefined(initializer) ? this.get<T>(key) : this.getDefault<T>(key, initializer)
      ).catch(() => {
        // ignore
      })
      from(promise).subscribe({
        next: wrapWith(zone, val => val !== undefined && observable.next(val)),
      })

      const rawObservable = this.storage.observe(key)

      const rawSubWrite = rawObservable
        .pipe(
          filter(noNil),
          distinctUntilChanged(),
          switchMap(x => this.deserialize<T>(x)),
        )
        .subscribe(observable)

      const rawSubDelete = rawObservable.pipe(filter(_.isNil)).subscribe(() => {
        observable.error(new Error(`key ${key} deleted from storage`))
        ;[rawSubWrite, rawSubDelete].forEach(sub => sub.unsubscribe())
        delete observables[key]
      })

      observable
        .pipe(
          distinctUntilChanged(isEqual),
          switchMap(x => this.serialize(x)),
          distinctUntilChanged(),
        )
        .subscribe(rawObservable)
    }
    return observables[key]!
  }
}
