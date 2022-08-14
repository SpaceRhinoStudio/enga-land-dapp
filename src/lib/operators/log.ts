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
  switchMap,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { wrapWith } from '$lib/utils/zone'
import { isWeb3Error, nameOfWeb3Error } from '$lib/helpers/web3-errors'
import { isEnumMember } from '$lib/utils/enum'
import { ActionStatus } from '$lib/types'
import { ajax } from 'rxjs/ajax'
import { config } from '$lib/configs'
import { Window$ } from '$lib/shared/observables/window'
import { combineLatestSwitchMap } from './combine-latest-switch'

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

function zoneTrack(zone: Zone): string[] {
  return zone.parent
    ? zone.parent !== Zone.root
      ? [...zoneTrack(zone.parent), zone.parent.name]
      : []
    : []
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
            Window$.pipe(
              combineLatestSwitchMap(win => of(win.localStorage.getItem('debug-id'))),
              switchMap(([win, debugId]) => {
                let message: string
                try {
                  message = JSON.stringify(
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
                  message = JSON.stringify(res.filter(x => x !== ' ' && x !== ''))
                }
                const id = `${zoneTrack(newZone).join('.')}__${res[0]}__${Date.now()}`
                win.localStorage.setItem(
                  'debug-sent',
                  JSON.stringify(
                    (JSON.parse(win.localStorage.getItem('debug-sent') ?? '[]') as string[]).concat(
                      id,
                    ),
                  ),
                )
                return ajax({
                  method: 'POST',
                  url: `${config.apiAddress}/debug/log`,
                  body: {
                    id: `${debugId}__${id}`,
                    message,
                  },
                })
              }),
            ).subscribe()
          }
          return x
        }),
      )
    }),
    dematerialize(),
  )
}
