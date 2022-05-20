import _ from 'lodash'
import { type MonoTypeOperatorFunction, pipe, tap } from 'rxjs'
import { unLazy } from '$lib/utils/un-lazy'

export function logOp<T>(
  ...messages: (string | ((source: T) => unknown))[]
): MonoTypeOperatorFunction<T> {
  return pipe(
    tap(x =>
      console.log(
        ...(messages.length === 0
          ? [x]
          : messages.length === 1
          ? [unLazy(messages[0], x), [x]]
          : messages.reduce(
              (acc, curr) => [...acc, ' ', _.isString(curr) ? curr.trim() : unLazy(curr, x)],
              [] as unknown[],
            )),
      ),
    ),
  )
}
