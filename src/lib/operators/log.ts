import '../../index'
import _ from 'lodash'
import { type MonoTypeOperatorFunction, pipe, dematerialize, materialize } from 'rxjs'
import { wrapWith } from '$lib/utils/zone'
import { LogLevel, Serializable } from '$lib/types'
import { tapWithIndex } from './tap-with-index'
import {
  formatForConsole,
  formatIndexForConsole,
  getLogTitle,
  logger,
  prepareForJSON,
  resolveDerivedForObservableNotification,
} from '$lib/utils/log'

export function logOpBase<T>(
  options: { level: LogLevel; save?: boolean; category: string },
  ...messages: (Serializable | ((source: T) => unknown))[]
): MonoTypeOperatorFunction<T> {
  const zone = Zone.current
  return pipe(
    materialize(),
    tapWithIndex((x, i) => {
      const now = new Date()
      const resolved = resolveDerivedForObservableNotification(x, ...messages)
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
      const consoleLogger = wrapWith(newZone, console.debug)
      void resolved.then(res => {
        if (options.save && x.kind !== 'C') {
          void wrapWith(zone, logger)(
            { ...options, now, zone: newZone },
            { index: i },
            ...res.map(prepareForJSON),
          )
        }
        const time = getLogTitle(options.level, options.category, now, newZone)[0]
        consoleLogger(
          ...['%c' + time, 'color: #666'],
          ...formatForConsole(options.level),
          options.category,
          ...formatIndexForConsole(i),
          ...res.flatMap(formatForConsole),
          ...(x.kind === 'N' ? [x.value] : []),
        )
        return
      })
    }),
    dematerialize(),
  )
}

type LogOperatorFunction = <T>(
  category: string,
  ...messages: (Serializable | ((source: T) => unknown))[]
) => MonoTypeOperatorFunction<T>

function logOpFactory(options: { level: LogLevel; save?: boolean }): LogOperatorFunction {
  return (category, ...messages) => logOpBase({ ...options, category }, ...messages)
}

interface LogOperator {
  <T>(
    category: string,
    ...messages: (Serializable | ((source: T) => unknown))[]
  ): MonoTypeOperatorFunction<T>
  fatal: LogOperatorFunction
  error: LogOperatorFunction
  warn: LogOperatorFunction
  notice: LogOperatorFunction
  info: LogOperatorFunction
  debug: LogOperatorFunction
}

//@ts-ignore
const logOp: LogOperator = logOpFactory({ level: 'TRACE', save: false })
logOp.debug = logOpFactory({ level: 'DEBUG', save: false })
logOp.info = logOpFactory({ level: 'INFO', save: false })
logOp.notice = logOpFactory({ level: 'NOTICE', save: true })
logOp.warn = logOpFactory({ level: 'WARN', save: true })
logOp.error = logOpFactory({ level: 'ERROR', save: true })
logOp.fatal = logOpFactory({ level: 'FATAL', save: true })

export { logOp }
