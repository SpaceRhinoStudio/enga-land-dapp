import { getSubjectValue } from '$lib/utils/get-subject-value'
import _ from 'lodash'
import { ReplaySubject } from 'rxjs'

export function useCreateControl<Control extends _.Dictionary<unknown> = never>(
  args: {
    omit?: (keyof Control)[]
  } = {},
): ReplaySubject<Partial<Control>> {
  const res = new ReplaySubject<Partial<Control>>(1)
  const next = res.next.bind(res)
  res.next = x => {
    next({ ...(_.omit(getSubjectValue(res) ?? {}, args?.omit ?? []) as Partial<Control>), ...x })
  }
  res.next({})
  return res
}
