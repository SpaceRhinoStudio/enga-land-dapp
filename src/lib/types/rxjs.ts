import { providers } from 'ethers'
import * as rxjs from 'rxjs'
import { Observable, OperatorFunction, UnaryFunction } from 'rxjs'
import { Option$ } from '.'
import { Web3ProviderId } from '$lib/shared/types/web3'

export type Web3ProviderMetadata = {
  web3Provider$: Observable<providers.Web3Provider>
  chainId$: Option$<number>
  id: Web3ProviderId
  provider$: Observable<providers.ExternalProvider>
  supportsAddEthereumChain?: boolean
}

export interface WithHooks<T extends (...args: unknown[]) => unknown, I = unknown, O = unknown> {
  (...args: Parameters<T>): ReturnType<T>
  preHooks?: ((x: I) => void)[]
  postHooks?: ((x: O) => void)[]
}

declare module 'rxjs' {
  export function pipe<T, A, B, C, D, E, F, G, H, I>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
  ): UnaryFunction<T, I>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
  ): UnaryFunction<T, J>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
  ): UnaryFunction<T, K>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
  ): UnaryFunction<T, L>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
  ): UnaryFunction<T, M>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
    fn14: UnaryFunction<M, N>,
  ): UnaryFunction<T, N>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
    fn14: UnaryFunction<M, N>,
    fn15: UnaryFunction<N, O>,
  ): UnaryFunction<T, O>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
    fn14: UnaryFunction<M, N>,
    fn15: UnaryFunction<N, O>,
    fn16: UnaryFunction<O, P>,
  ): UnaryFunction<T, P>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
    fn14: UnaryFunction<M, N>,
    fn15: UnaryFunction<N, O>,
    fn16: UnaryFunction<O, P>,
    fn17: UnaryFunction<P, Q>,
  ): UnaryFunction<T, Q>
  export function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
    fn1: UnaryFunction<T, A>,
    fn2: UnaryFunction<A, B>,
    fn3: UnaryFunction<B, C>,
    fn4: UnaryFunction<C, D>,
    fn5: UnaryFunction<D, E>,
    fn6: UnaryFunction<E, F>,
    fn7: UnaryFunction<F, G>,
    fn8: UnaryFunction<G, H>,
    fn9: UnaryFunction<H, I>,
    fn10: UnaryFunction<I, J>,
    fn11: UnaryFunction<J, K>,
    fn12: UnaryFunction<K, L>,
    fn13: UnaryFunction<L, M>,
    fn14: UnaryFunction<M, N>,
    fn15: UnaryFunction<N, O>,
    fn16: UnaryFunction<O, P>,
    fn17: UnaryFunction<P, Q>,
    fn18: UnaryFunction<Q, R>,
  ): UnaryFunction<A, R>

  class Observable<T> {
    pipe<A, B, C, D, E, F, G, H, I>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
    ): Observable<I>
    pipe<A, B, C, D, E, F, G, H, I, J>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
    ): Observable<J>
    pipe<A, B, C, D, E, F, G, H, I, J, K>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
    ): Observable<K>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
    ): Observable<L>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
    ): Observable<M>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
      op14: OperatorFunction<M, N>,
    ): Observable<N>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
      op14: OperatorFunction<M, N>,
      op15: OperatorFunction<N, O>,
    ): Observable<O>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
      op14: OperatorFunction<M, N>,
      op15: OperatorFunction<N, O>,
      op16: OperatorFunction<O, P>,
    ): Observable<P>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
      op14: OperatorFunction<M, N>,
      op15: OperatorFunction<N, O>,
      op16: OperatorFunction<O, P>,
      op17: OperatorFunction<P, Q>,
    ): Observable<Q>
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      op10: OperatorFunction<I, J>,
      op11: OperatorFunction<J, K>,
      op12: OperatorFunction<K, L>,
      op13: OperatorFunction<L, M>,
      op14: OperatorFunction<M, N>,
      op15: OperatorFunction<N, O>,
      op16: OperatorFunction<O, P>,
      op17: OperatorFunction<P, Q>,
      op18: OperatorFunction<Q, R>,
    ): Observable<R>
  }
}
