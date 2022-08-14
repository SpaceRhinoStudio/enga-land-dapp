import _ from 'lodash'
import {
  type MonoTypeOperatorFunction,
  pipe,
  concatMap,
  map,
  from,
  of,
  reduce,
  dematerialize,
  materialize,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { wrapWith } from '$lib/utils/zone'
import { isWeb3Error, nameOfWeb3Error } from '$lib/helpers/web3-errors'
import { isEnumMember } from '$lib/utils/enum'
import { ActionStatus } from '$lib/types'
import { addToLogs } from 'src'

const isAction = isEnumMember(ActionStatus)

function transform(x: unknown): unknown[] {
  if (isWeb3Error(x)) {
    return ['%c' + nameOfWeb3Error(x), 'color: #f00']
  }
  if (isAction(x)) {
    return ['%c' + x, 'color: #e50']
  }

  return [x]
}

export function logOp<T>(
  ...messages: (string | number | ((source: T) => unknown) | 'SEND_LOG')[]
): MonoTypeOperatorFunction<T> {
  const zone = Zone.current
  return pipe(
    materialize(),
    concatMap((x, i) => {
      return from(
        x.kind !== 'N'
          ? messages.filter(_.negate(_.isFunction)).filter(e => e !== 'SEND_LOG')
          : _.castArray(messages).filter(e => e !== 'SEND_LOG'),
      ).pipe(
        concatMap(curr =>
          _.isString(curr) ? of(curr.trim()) : from(Promise.resolve(unLazy(curr, x.value!))),
        ),
        reduce((acc, curr) => [...acc, ...(acc.length ? [' '] : []), curr], [] as unknown[]),
        map(res => {
          const newZone =
            zone === Zone.current
              ? zone
              : zone.fork({
                  name: Zone.current.name,
                  properties: {
                    fgColor: Zone.current.get('fgColor'),
                    bgColor: Zone.current.get('bgColor'),
                  },
                })
          wrapWith(newZone, console.debug)(
            `%c[${i}]`,
            'color: #666',
            ...res,
            ...(x.kind === 'N'
              ? transform(x.value)
              : x.kind === 'C'
              ? ['OBSERVABLE_COMPLETE']
              : ['OBSERVABLE_ERROR', x.error]),
          )
          if (messages.includes('SEND_LOG')) {
            let log: string
            try {
              log = JSON.stringify(
                res
                  .filter(x => x !== ' ' && x !== '')
                  .concat(
                    messages.findIndex(x => _.isFunction(x)) === -1
                      ? x.kind === 'N'
                        ? transform(x.value)
                        : x.kind === 'C'
                        ? ['OBSERVABLE_COMPLETE']
                        : ['OBSERVABLE_ERROR', x.error]
                      : [],
                  ),
              )
            } catch {
              log = JSON.stringify(res.filter(x => x !== ' ' && x !== ''))
            }
            void addToLogs(newZone, String(res[0]), log)
          }
          return x
        }),
      )
    }),
    dematerialize(),
  )
}
