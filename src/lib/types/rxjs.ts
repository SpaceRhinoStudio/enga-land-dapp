import { providers } from 'ethers'
import * as rxjs from 'rxjs'
import { Observable, OperatorFunction } from 'rxjs'
import { Option$ } from '.'
import { Web3ProviderId } from './web3'

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
