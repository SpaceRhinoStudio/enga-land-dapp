import { getSubjectValue } from '$lib/utils/get-subject-value'
import { ReplaySubject } from 'rxjs'

export function useCreateControl<Control extends _.Dictionary<unknown> = never>(): ReplaySubject<
  Partial<Control>
> {
  const res = new ReplaySubject<Partial<Control>>(1)
  const next = res.next.bind(res)
  res.next = x => {
    next({ ...(getSubjectValue(res) ?? {}), ...x })
  }
  res.next({})
  return res
}
