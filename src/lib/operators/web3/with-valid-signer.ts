import { passNil } from '$lib/operators/pass-undefined'
import { distinctUntilChanged, filter, of, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { JsonRpcSigner } from '@ethersproject/providers'
import _ from 'lodash'
import type { Contract } from 'ethers'
import { withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import { SelectedWeb3Signer$, signerAddress$ } from '$lib/observables/selected-web3-provider'
import { noNil, noSentinelOrUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'
import type { Nil } from '$lib/types'

export function withValidSigner<T extends Contract, R>(
  operator: OperatorFunction<[contract: T, signer: JsonRpcSigner], R>,
): OperatorFunction<T | Nil, R | Nil> {
  return pipe(
    passNil(
      withUpdatesUntilChanged(
        SelectedWeb3Signer$.pipe(filter(noSentinelOrUndefined), filter(noNil)),
      ),
      operator,
    ),
    distinctUntilChanged(),
  )
}

type InputType<T> = T | Nil
type OperatorInputType<T> = readonly [contract: T, address: string]
type OutputType<R> = R | Nil
export function withValidSignerAddress<T>(): OperatorFunction<
  InputType<T>,
  OutputType<InputType<T>>
>
export function withValidSignerAddress<T, A>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
): OperatorFunction<InputType<T>, OutputType<A>>
export function withValidSignerAddress<T, A, B>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
): OperatorFunction<InputType<T>, OutputType<B>>
export function withValidSignerAddress<T, A, B, C>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
): OperatorFunction<InputType<T>, OutputType<C>>
export function withValidSignerAddress<T, A, B, C, D>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
): OperatorFunction<InputType<T>, OutputType<D>>
export function withValidSignerAddress<T, A, B, C, D, E>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
): OperatorFunction<InputType<T>, OutputType<E>>
export function withValidSignerAddress<T, A, B, C, D, E, F>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
): OperatorFunction<InputType<T>, OutputType<F>>
export function withValidSignerAddress<T, A, B, C, D, E, F, G>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
): OperatorFunction<InputType<T>, OutputType<G>>
export function withValidSignerAddress<T, A, B, C, D, E, F, G, H>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
): OperatorFunction<InputType<T>, OutputType<H>>
export function withValidSignerAddress<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
): OperatorFunction<InputType<T>, OutputType<I>>
export function withValidSignerAddress<T, A, B, C, D, E, F, G, H, I>(
  fn1: OperatorFunction<OperatorInputType<T>, A>,
  fn2: OperatorFunction<A, B>,
  fn3: OperatorFunction<B, C>,
  fn4: OperatorFunction<C, D>,
  fn5: OperatorFunction<D, E>,
  fn6: OperatorFunction<E, F>,
  fn7: OperatorFunction<F, G>,
  fn8: OperatorFunction<G, H>,
  fn9: OperatorFunction<H, I>,
  ...fns: OperatorFunction<unknown, unknown>[]
): OperatorFunction<InputType<T>, OutputType<unknown>>

export function withValidSignerAddress<T extends Contract>(
  ...fns: readonly OperatorFunction<OperatorInputType<T>, unknown>[]
): OperatorFunction<InputType<T>, unknown> {
  return pipe(
    passNil(
      withUpdatesUntilChanged(signerAddress$),
      switchMap(([contract, address]) =>
        _.isUndefined(address)
          ? of(null)
          : of([contract, address] as const).pipe(
              //@ts-ignore it accepts any number of operations
              ...fns,
            ),
      ),
    ),
    distinctUntilChanged(),
  )
}
