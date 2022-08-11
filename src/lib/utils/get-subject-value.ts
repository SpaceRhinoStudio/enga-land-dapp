import { Option } from '$lib/types'
import type { Observable } from 'rxjs'

/**@description to be used only with ReplaySubjects */

export function getSyncSubjectValue<T>(subject: Option<Observable<T>>): T | undefined {
  let current: T | undefined = undefined
  const sub = subject?.subscribe(value => {
    current = value
  })
  sub?.unsubscribe()
  return current
}
