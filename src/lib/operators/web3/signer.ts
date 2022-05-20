import { passNil, passUndefined } from '$lib/operators/pass-undefined'
import { safeThrowMap, safeThrowMergeMap } from '$lib/operators/safe-throw'
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  mergeMap,
  of,
  type OperatorFunction,
  pipe,
  switchMap,
} from 'rxjs'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import type { JsonRpcSigner } from '@ethersproject/providers'
import type EventEmitter from 'events'
import { safeCatchAndIgnoreAlreadyInProgressError } from '$lib/operators/web3/ignore-alreadyInProgress-error'
import _ from 'lodash'
import type { Contract } from 'ethers'
import { withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import {
  SelectedWeb3Signer$,
  SelectedWeb3SignersAddress$,
} from '$lib/observables/selected-web3-provider'
import { noSentinelOrUndefined } from '$lib/utils/no-sentinel-or-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import type { Nil } from '$lib/types'

export const web3Signer: OperatorFunction<Web3ProviderMetadata, JsonRpcSigner | undefined> = pipe(
  passUndefined(
    mergeMap(x => x.web3Provider$),
    safeThrowMap(x => x.getSigner()),
  ),
)

export const web3SignerAddressChangeTrigger: OperatorFunction<Web3ProviderMetadata, true> = pipe(
  switchMap(x => x.provider$),
  switchMap(x => merge(fromEvent(x as EventEmitter, 'accountsChanged'))),
  map(() => true),
)

const web3SignerAndAddress: OperatorFunction<
  Web3ProviderMetadata,
  readonly [JsonRpcSigner | undefined, string | undefined]
> = pipe(
  reEmitUntilChanged(x => of(x).pipe(web3SignerAddressChangeTrigger)),
  web3Signer,
  mergeMap(signer =>
    of(signer).pipe(
      distinctUntilChanged(),
      safeThrowMergeMap(x => x?.getAddress() ?? of(undefined)),
      safeCatchAndIgnoreAlreadyInProgressError(() => of(undefined)),
      map(address => [signer, _.isEmpty(address) ? undefined : address] as const),
    ),
  ),
)

export const web3SignerWithAddress: OperatorFunction<
  Web3ProviderMetadata,
  JsonRpcSigner | undefined
> = pipe(
  web3SignerAndAddress,
  map(([signer, address]) => (signer && address ? signer : undefined)),
)

export const web3SignersAddress: OperatorFunction<Web3ProviderMetadata, string | undefined> = pipe(
  web3SignerAndAddress,
  map(([, address]) => address),
)

export function withValidSigner<T extends Contract, R>(
  operator: OperatorFunction<[contract: T, signer: JsonRpcSigner], R>,
): OperatorFunction<T | undefined, R | undefined> {
  return pipe(
    passUndefined(
      withUpdatesUntilChanged(SelectedWeb3Signer$.pipe(filter(noSentinelOrUndefined))),
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
      withUpdatesUntilChanged(SelectedWeb3SignersAddress$),
      switchMap(([contract, address]) =>
        _.isUndefined(address)
          ? of(undefined)
          : of([contract, address] as const).pipe(
              //@ts-ignore it accepts any number of operations
              ...fns,
            ),
      ),
    ),
    distinctUntilChanged(),
  )
}
