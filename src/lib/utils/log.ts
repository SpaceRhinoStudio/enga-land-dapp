import { localCache } from '$lib/contexts/local-cache'
import { inferWeb3Error, isWeb3Error, nameOfWeb3Error } from '$lib/helpers/web3-errors'
import { isAction, LogLevel, Serializable, SerializableCollection } from '$lib/types'
import _ from 'lodash'
import {
  concatMap,
  firstValueFrom,
  from,
  map,
  ObservableNotification,
  take,
  tap,
  toArray,
} from 'rxjs'
import { unLazy } from '$lib/shared/utils/un-lazy'
import { keysOf } from '$lib/shared/utils/type-safe'

export function log<T>(input: T, message?: string | ((x: T) => string)): T {
  console.debug(_.isFunction(message) ? message(input) : message, [input])
  return input
}

function pushTo(source: _.Dictionary<unknown> | unknown[]) {
  return function (key: string | number, value: unknown) {
    //@ts-ignore
    source[key] = value
  }
}

export function prepareForJSON(obj: unknown): Serializable {
  const seen = new Map()
  const recurse = (obj: unknown): Serializable => {
    if (_.isObject(obj)) {
      const acc: SerializableCollection = _.isArray(obj) ? [] : {}
      const push = pushTo(acc)
      seen.set(obj, true)
      _.entries(obj).forEach(([k, v]) => {
        if (seen.has(v)) {
          return
        }
        try {
          JSON.stringify(v)
          push(k, v)
          return
        } catch {
          push(k, recurse(v))
          return
        }
      })
      return acc
    }
    return obj as Exclude<any, object>
  }
  return recurse(obj)
}

function isObservableNotification(x: unknown): x is ObservableNotification<unknown> {
  if (!_.isObject(x)) {
    return false
  }
  const kind = _.get(x, 'kind')
  if (kind === 'N' || kind === 'E' || kind === 'C') {
    return true
  }
  return false
}

const logLevelsConsoleStyle: { [key in LogLevel]: string } = {
  FATAL: 'background: #f00; color: #000',
  ERROR: 'background: #ff2e32; color: #000',
  WARN: 'background: #ff5200; color: #000',
  NOTICE: 'background: #ffea00; color: #000',
  INFO: 'background: #fff; color: #000',
  DEBUG: 'background: #00f; color: #fff',
  TRACE: 'background: #00fffd; color: #000',
}

function isLogLevel(x: unknown): x is LogLevel {
  if (keysOf(logLevelsConsoleStyle).includes(x as any)) {
    return true
  }
  return false
}

export function formatForConsole(x: unknown): unknown[] {
  if (isLogLevel(x)) {
    return [`%c ${x} `, logLevelsConsoleStyle[x]]
  }
  if (isObservableNotification(x)) {
    return x.kind === 'N'
      ? formatForConsole(x.value)
      : x.kind === 'C'
      ? ['%c' + 'OBSERVABLE_COMPLETE', 'color: #00c52e']
      : ['%c' + 'OBSERVABLE_ERROR', 'color: #f00', x.error]
  }
  if (isWeb3Error(x)) {
    return ['%c' + nameOfWeb3Error(x), 'color: #f00']
  }
  if (isAction(x)) {
    return ['%c' + x, 'color: #e50']
  }
  const err = inferWeb3Error(x)
  if (!_.isUndefined(err)) {
    return [...formatForConsole(err), err]
  }
  return [x]
}

export function formatIndexForConsole(i: number): string[] {
  return [`%c[${i}]`, 'color: #666']
}

function resolveDerived(x: unknown, ...derived: unknown[]) {
  return firstValueFrom(
    from(derived).pipe(
      concatMap(curr => from(Promise.resolve(unLazy(curr, x)))),
      toArray(),
    ),
  )
}

export function resolveDerivedForObservableNotification(
  x: ObservableNotification<unknown>,
  ...derived: unknown[]
): Promise<unknown[]> {
  return x.kind !== 'N'
    ? resolveDerived(undefined, ...derived.map(x => (_.isFunction(x) ? null : x)))
    : resolveDerived(x.value, ...derived)
}

export function zoneTrack(zone: Zone): string[] {
  return zone.parent
    ? zone.parent !== Zone.root
      ? [...zoneTrack(zone.parent), zone.parent.name]
      : []
    : []
}

function pad(length: number, input: string | number): string {
  return String(input).padStart(length, '0')
}

export function getLogTitle(
  level: LogLevel,
  category: string,
  now: Date,
  zone?: Zone,
): [time: string, level: string, zones: string, category: string] {
  const zones = zoneTrack(zone ?? Zone.current)
  return [
    `${now.getUTCFullYear()}-${pad(2, now.getUTCMonth() + 1)}-${pad(2, now.getUTCDate())} ${pad(
      2,
      now.getUTCHours(),
    )}:${pad(2, now.getUTCMinutes())}:${pad(2, now.getUTCSeconds())},${pad(
      3,
      now.getUTCMilliseconds(),
    )}`,
    `${level}`,
    `[${zones.join('.')}]`,
    `${category}`,
  ]
}

const logs$ = localCache.observe<{ [title: string]: Serializable[] }>('logs', {})

export function logger(
  options: { level: LogLevel; category: string; now?: Date | undefined; zone?: Zone },
  ...logs: Serializable[]
): Promise<void> {
  const now = options.now ?? new Date()

  const title = getLogTitle(options.level, options.category, now, options.zone).join(' ')
  return firstValueFrom(
    logs$.pipe(
      take(1),
      map(x => ({ ...x, [title]: logs })),
      tap(x => logs$.next(x)),
    ),
  ).then(_.noop)
}

setTimeout(() => {
  void logger({ level: 'INFO', category: 'Bootstrap' }, true)
}, 0)
