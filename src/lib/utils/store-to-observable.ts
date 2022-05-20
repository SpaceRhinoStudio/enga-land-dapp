import { Observable, ReplaySubject, Subject } from 'rxjs'
import type { Readable, Writable } from 'svelte/store'

export function toObservable<T>(readable: Readable<T>): Observable<T> {
  const res = new ReplaySubject<T>(1)
  readable.subscribe(x => res.next(x))
  return res.asObservable()
}

export function bindObservable<T>(writable: Writable<T>): ReplaySubject<T> {
  const res = new ReplaySubject<T>(1)
  const lock = { update: false }
  writable.subscribe(x => {
    if (!lock.update) {
      res.next(x)
    }
    lock.update = false
  })
  res.subscribe(x => {
    lock.update = true
    writable.set(x)
  })
  return res
}
