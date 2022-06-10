import _ from 'lodash'
import { type MonoTypeOperatorFunction, pipe, tap } from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'

export function logOp<T>(
  ...messages: (string | ((source: T) => unknown))[]
): MonoTypeOperatorFunction<T> {
  return pipe(
    tap(async x => {
      let res: unknown[] = []
      if (messages.length === 0) {
        res = [x]
      } else if (messages.length === 1) {
        res = [await unLazy(messages[0], x), [x]]
      } else {
        for (const curr of messages) {
          res.push(' ')
          res.push(_.isString(curr) ? curr.trim() : await unLazy(curr, x))
        }
      }
      console.log(...res)
    }),
  )
}
