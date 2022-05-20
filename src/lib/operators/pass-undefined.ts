import _ from 'lodash'
import { groupBy, identity, mergeMap, type OperatorFunction, pipe } from 'rxjs'
import type { Nil } from '$lib/types'

export function passUndefined(): typeof identity
export function passUndefined<T, A>(
  fn1: OperatorFunction<T, A>,
): OperatorFunction<T | undefined, A | undefined>
export function passUndefined<T, A, B>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
): OperatorFunction<T | undefined, B | undefined>
export function passUndefined<T, A, B, C>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
): OperatorFunction<T | undefined, C | undefined>
export function passUndefined<T, A, B, C, D>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
): OperatorFunction<T | undefined, D | undefined>
export function passUndefined<T, A, B, C, D, E>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
): OperatorFunction<T | undefined, E | undefined>
export function passUndefined<T, A, B, C, D, E, F>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
): OperatorFunction<T | undefined, F | undefined>
export function passUndefined<T, A, B, C, D, E, F, G>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
): OperatorFunction<T | undefined, G | undefined>
export function passUndefined<T, A, B, C, D, E, F, G, H>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
): OperatorFunction<T | undefined, H | undefined>
export function passUndefined<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
): OperatorFunction<T | undefined, I | undefined>
export function passUndefined<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
  ...fns: OperatorFunction<unknown, unknown>[]
): OperatorFunction<T | undefined, unknown | undefined>

export function passUndefined<T>(
  ...fns: readonly OperatorFunction<unknown, unknown>[]
): OperatorFunction<T | undefined, unknown> {
  return pipe(
    groupBy(x => _.isUndefined(x)),
    mergeMap(x$ =>
      x$.key === false
        ? x$.pipe(
            //@ts-ignore it accepts any number of operations
            ...fns,
          )
        : x$,
    ),
  )
}

export function passNil(): typeof identity
export function passNil<T, A>(fn1: OperatorFunction<T, A>): OperatorFunction<T | Nil, A | Nil>
export function passNil<T, A, B>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
): OperatorFunction<T | Nil, B | Nil>
export function passNil<T, A, B, C>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
): OperatorFunction<T | Nil, C | Nil>
export function passNil<T, A, B, C, D>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
): OperatorFunction<T | Nil, D | Nil>
export function passNil<T, A, B, C, D, E>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
): OperatorFunction<T | Nil, E | Nil>
export function passNil<T, A, B, C, D, E, F>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
): OperatorFunction<T | Nil, F | Nil>
export function passNil<T, A, B, C, D, E, F, G>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
): OperatorFunction<T | Nil, G | Nil>
export function passNil<T, A, B, C, D, E, F, G, H>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
): OperatorFunction<T | Nil, H | Nil>
export function passNil<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
): OperatorFunction<T | Nil, I | Nil>
export function passNil<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
  ...fns: OperatorFunction<unknown, unknown>[]
): OperatorFunction<T | Nil, unknown | Nil>

export function passNil<T>(
  ...fns: readonly OperatorFunction<unknown, unknown>[]
): OperatorFunction<T, unknown> {
  return pipe(
    groupBy(x => _.isNil(x)),
    mergeMap(x$ =>
      x$.key === false
        ? x$.pipe(
            //@ts-ignore it accepts any number of operations
            ...fns,
          )
        : x$,
    ),
  )
}
