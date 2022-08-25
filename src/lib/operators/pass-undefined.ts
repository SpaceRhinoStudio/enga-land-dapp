import _ from 'lodash'
import { groupBy, identity, mergeMap, type OperatorFunction, pipe, map, switchMap, of } from 'rxjs'
import type { NilOf, NilOfMembers, Some, SomeMembers } from '$lib/types'

/**@deprecated use `passNil` instead */
export function passUndefined(): typeof identity
/**@deprecated use `passNil` instead */
export function passUndefined<T, A>(
  fn1: OperatorFunction<T, A>,
): OperatorFunction<T | undefined, A | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
): OperatorFunction<T | undefined, B | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B, C>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
): OperatorFunction<T | undefined, C | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B, C, D>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
): OperatorFunction<T | undefined, D | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B, C, D, E>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
): OperatorFunction<T | undefined, E | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B, C, D, E, F>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
): OperatorFunction<T | undefined, F | undefined>
/**@deprecated use `passNil` instead */
export function passUndefined<T, A, B, C, D, E, F, G>(
  fn1: OperatorFunction<T, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
): OperatorFunction<T | undefined, G | undefined>
/**@deprecated use `passNil` instead */
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
/**@deprecated use `passNil` instead */
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
/**@deprecated use `passNil` instead */
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

/**@deprecated use `passNil` instead */
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

/**  */
export function mergeSome<T>(): OperatorFunction<T, T | NilOf<T>>
/**  */
export function mergeSome<T, A>(
  op1: OperatorFunction<Some<T>, A>,
): OperatorFunction<T, A | NilOf<T>>
/**  */
export function mergeSome<T, A, B>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
): OperatorFunction<T, B | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
): OperatorFunction<T, C | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
): OperatorFunction<T, D | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
): OperatorFunction<T, E | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E, F>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
): OperatorFunction<T, F | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E, F, G>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
): OperatorFunction<T, G | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E, F, G, H>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
): OperatorFunction<T, H | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
): OperatorFunction<T, I | NilOf<T>>
/**  */
export function mergeSome<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
  ...ops: OperatorFunction<unknown, unknown>[]
): OperatorFunction<T, unknown | NilOf<T>>

//TODO: replace inner implementation with passNilIf
/**  */
export function mergeSome<T>(
  ...ops: readonly OperatorFunction<Some<T>, unknown>[]
): OperatorFunction<T, unknown> {
  return pipe(
    mergeMap(x =>
      _.isNil(x)
        ? of(x)
        : of(x).pipe(
            //@ts-ignore it accepts any number of operations
            ...ops,
          ),
    ),
  )
}

/**  */
export function switchSome<T>(): OperatorFunction<T, T | NilOf<T>>
/**  */
export function switchSome<T, A>(
  op1: OperatorFunction<Some<T>, A>,
): OperatorFunction<T, A | NilOf<T>>
/**  */
export function switchSome<T, A, B>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
): OperatorFunction<T, B | NilOf<T>>
/**  */
export function switchSome<T, A, B, C>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
): OperatorFunction<T, C | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
): OperatorFunction<T, D | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
): OperatorFunction<T, E | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E, F>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
): OperatorFunction<T, F | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E, F, G>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
): OperatorFunction<T, G | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E, F, G, H>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
): OperatorFunction<T, H | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
): OperatorFunction<T, I | NilOf<T>>
/**  */
export function switchSome<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<Some<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
  ...ops: OperatorFunction<unknown, unknown>[]
): OperatorFunction<T, unknown | NilOf<T>>

//TODO: replace inner implementation with passNilIf
/**  */
export function switchSome<T>(
  ...ops: readonly OperatorFunction<Some<T>, unknown>[]
): OperatorFunction<T, unknown> {
  return pipe(
    switchMap(x =>
      _.isNil(x)
        ? of(x)
        : of(x).pipe(
            //@ts-ignore it accepts any number of operations
            ...ops,
          ),
    ),
  )
}

/**  */
export function switchSomeMembers<T>(): OperatorFunction<T, T | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A>(
  op1: OperatorFunction<SomeMembers<T>, A>,
): OperatorFunction<T, A | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
): OperatorFunction<T, B | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
): OperatorFunction<T, C | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
): OperatorFunction<T, D | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
): OperatorFunction<T, E | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E, F>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
): OperatorFunction<T, F | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E, F, G>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
): OperatorFunction<T, G | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E, F, G, H>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
): OperatorFunction<T, H | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
): OperatorFunction<T, I | NilOfMembers<T>>
/**  */
export function switchSomeMembers<T, A, B, C, D, E, F, G, H, I>(
  op1: OperatorFunction<SomeMembers<T>, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>,
  op7: OperatorFunction<F, G>,
  op8: OperatorFunction<G, H>,
  op9: OperatorFunction<H, I>,
  ...ops: OperatorFunction<unknown, unknown>[]
): OperatorFunction<T, unknown | NilOfMembers<T>>

/**  */
export function switchSomeMembers<T extends readonly unknown[]>(
  ...ops: readonly OperatorFunction<SomeMembers<T>, unknown>[]
): OperatorFunction<T, unknown> {
  return switchSome(
    switchMap(arr =>
      arr.some(_.isNull)
        ? of(null)
        : arr.some(_.isUndefined)
        ? of(undefined)
        : of(arr).pipe(
            //@ts-ignore it accepts any number of operations
            ...ops,
          ),
    ),
  )
}

export function mapNil<T, R>(
  project: (value: NilOf<T>, index: number) => R,
): OperatorFunction<T, Some<T> | R> {
  return map((x, index) => (_.isNil(x) ? project(x as NilOf<T>, index) : (x as Some<T>)))
}
