export type Fn<T extends readonly unknown[], R> = (...args: T) => R

export function copyFn<T extends readonly unknown[], R>(fn: Fn<T, R>): Fn<T, R> {
  return (...args) => fn(...args)
}

export function wrap<T extends readonly unknown[], R>(fn: Fn<T, R>): Fn<T, R>
export function wrap<T extends readonly unknown[], R>(source: string, fn: Fn<T, R>): Fn<T, R>
export function wrap<T extends readonly unknown[], R>(
  sourceOrFn: Fn<T, R> | string,
  fn?: Fn<T, R>,
): Fn<T, R> {
  return Zone.current.wrap(copyFn(fn ?? (sourceOrFn as Fn<T, R>)), fn ? (sourceOrFn as string) : '')
}

export function wrapWith<T extends readonly unknown[], R>(zone: Zone, fn: Fn<T, R>): Fn<T, R>
export function wrapWith<T extends readonly unknown[], R>(
  zone: Zone,
  source: string,
  fn: Fn<T, R>,
): Fn<T, R>
export function wrapWith<T extends readonly unknown[], R>(
  zone: Zone,
  sourceOrFn: Fn<T, R> | string,
  fn?: Fn<T, R>,
): Fn<T, R> {
  return zone.wrap(copyFn(fn ?? (sourceOrFn as Fn<T, R>)), fn ? (sourceOrFn as string) : '')
}

export function forkWrap<T extends readonly unknown[], R>(name: string, fn: Fn<T, R>): Fn<T, R>
export function forkWrap<T extends readonly unknown[], R>(
  name: string,
  bgColor: string,
  fn: Fn<T, R>,
): Fn<T, R>
export function forkWrap<T extends readonly unknown[], R>(
  name: string,
  fnOrBg: Fn<T, R> | string,
  fn?: Fn<T, R>,
): Fn<T, R> {
  return Zone.current
    .fork({ name, properties: fn ? { bgColor: fnOrBg } : {} })
    .wrap(copyFn(fn ?? (fnOrBg as Fn<T, R>)), '')
}

export function forkFrom(
  zone: Zone,
  name: string,
  colors?: [bgColor: string, fgColor: string],
): Zone {
  return zone.fork({ name, properties: { bgColor: colors?.[0], fgColor: colors?.[1] } })
}

export function fork(name: string, colors?: [bgColor: string, fgColor: string]): Zone {
  return Zone.current.fork({ name, properties: { bgColor: colors?.[0], fgColor: colors?.[1] } })
}

export function run<T extends readonly unknown[], R>(fn: Fn<T, R>): R {
  return Zone.current.run(fn)
}

export function runAs<T extends readonly unknown[], R>(zone: Zone, fn: Fn<T, R>): R {
  return zone.run(fn)
}
