export type Fn<T extends readonly unknown[], R> = (...args: T) => R

export function wrap<T extends readonly unknown[], R>(fn: Fn<T, R>): Fn<T, R>
export function wrap<T extends readonly unknown[], R>(source: string, fn: Fn<T, R>): Fn<T, R>
export function wrap<T extends readonly unknown[], R>(
  sourceOrFn: Fn<T, R> | string,
  fn?: Fn<T, R>,
): Fn<T, R> {
  return Zone.current.wrap(fn ?? (sourceOrFn as Fn<T, R>), fn ? (sourceOrFn as string) : '')
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
  return zone.wrap(fn ?? (sourceOrFn as Fn<T, R>), fn ? (sourceOrFn as string) : '')
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
    .wrap(fn ?? (fnOrBg as Fn<T, R>), '')
}

export function run<T extends readonly unknown[], R>(fn: Fn<T, R>): R {
  return Zone.current.run(fn)
}

export function runAs<T extends readonly unknown[], R>(zone: Zone, fn: Fn<T, R>): R {
  return zone.run(fn)
}
