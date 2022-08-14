import { config } from '$lib/configs'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { firstValueFrom } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import 'zone.js'
import 'zone.js/plugins/zone-error'

function isStyled(x: string): boolean {
  return _.isString(x) && x.startsWith('%c')
}

function zoneParentTag(zone: Zone): string[] {
  return zone.parent
    ? zone.parent !== Zone.root
      ? [
          ...zoneParentTag(zone.parent),
          `%c${zone.parent.name}`,
          `background: ${zone.parent.get('bgColor') ?? '#b07900'}; color: ${
            zone.parent.get('fgColor') ?? '#fff'
          }`,
          '/',
        ]
      : []
    : []
}

function remapLog(log: (...args: any[]) => void): (...args: any[]) => void {
  return (...args) => {
    const spaceIfSingle = Zone.current.parent === Zone.root ? ' ' : ''
    const zoneTag =
      Zone.current !== Zone.root
        ? [
            `%c${spaceIfSingle}${Zone.current.name}${spaceIfSingle}`,
            `background: ${Zone.current.get('bgColor') ?? '#b07900'}; color: ${
              Zone.current.get('fgColor') ?? '#fff'
            }`,
          ]
        : []
    const tags = [...zoneParentTag(Zone.current), ...zoneTag]
    const styles = [] as string[]
    const res = [''] as unknown[]
    ;[...tags, ...args].forEach((x, i, arr) => {
      if (i !== 0 && isStyled(arr[i - 1])) {
        return
      }
      if (res.length === 1 && _.isString(x) && _.isString(res[0])) {
        const shouldAddSpace = i > tags.length - 1 && res[0].length
        shouldAddSpace && styles.push('')
        styles.push(isStyled(x) ? arr[i + 1] : '')
        res[0] += (shouldAddSpace ? '%c ' : '') + (isStyled(x) ? x : '%c' + x)
        return
      }
      res.push(x)
    })
    log(res[0], ...styles, ...res.slice(1))
  }
}

console.debug = remapLog(console.debug)
console.log = remapLog(console.log)
console.warn = remapLog(console.warn)
console.error = remapLog(console.error)
console.info = remapLog(console.info)

if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  if (!window.localStorage.getItem('debug-id')) {
    window.localStorage.setItem('debug-id', nanoid())
  }
}

function zoneTrack(zone: Zone): string[] {
  return zone.parent
    ? zone.parent !== Zone.root
      ? [...zoneTrack(zone.parent), zone.parent.name]
      : []
    : []
}

export function addToLogs(zone: Zone, title: string, log: string): Promise<unknown> {
  const id = `${zoneTrack(zone).join('.')}__${title}__${Date.now()}`
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    const debugId = window.localStorage.getItem('debug-id')
    window.localStorage.setItem(
      'debug-sent',
      JSON.stringify(
        (JSON.parse(window.localStorage.getItem('debug-sent') ?? '[]') as string[]).concat(id),
      ),
    )
    return firstValueFrom(
      ajax({
        method: 'POST',
        url: `${config.apiAddress}/debug/log`,
        body: {
          id: `${debugId}__${id}`,
          message: log,
        },
      }),
    )
  }
  return Promise.resolve()
}

void addToLogs(Zone.root, 'Start', '[]')
