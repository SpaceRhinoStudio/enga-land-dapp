import { passUndefined } from '$lib/operators/pass-undefined'
import { safeThrowMap, safeThrowMergeMap } from '$lib/operators/safe-throw'
import {
  distinctUntilChanged,
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
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'

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
