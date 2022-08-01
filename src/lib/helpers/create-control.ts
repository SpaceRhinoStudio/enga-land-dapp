import { getSubjectValue } from '$lib/utils/get-subject-value'
import _ from 'lodash'
import { ReplaySubject } from 'rxjs'

/**
 * @description this is a helper function to create a control `Subject` with a custom `next` function that preserves all the previous values of the control object so that the control object can be used as a svelte state without problems. there is also an `omit` argument to omit certain properties from being constantly preserved across all emissions of the subject for special cases
 */
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
