import { map, merge, of, type OperatorFunction, pipe, switchMap } from 'rxjs'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import type { JsonRpcSigner } from '@ethersproject/providers'
import type EventEmitter from 'events'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import { combineLatestSwitchMap } from '../combine-latest-switch'
import { switchSome } from '../pass-undefined'
import { fromEventZone } from '../zone'
import { forkWrap } from '$lib/utils/zone'
import { safeMap, safeSwitchMap } from '../safe-throw'

const signerChangeTrigger$$ = (meta: Web3ProviderMetadata) =>
  meta.provider$.pipe(
    switchMap(
      forkWrap('AccountsChanged', x =>
        merge(
          fromEventZone(x as EventEmitter, 'accountsChanged'),
          // fromEvent(x as EventEmitter, 'connect'),
          // fromEvent(x as EventEmitter, 'disconnect'),
        ),
      ),
    ),
    map(() => true),
  )

export const mapToSigner: OperatorFunction<Web3ProviderMetadata, JsonRpcSigner | null> = pipe(
  reEvaluateSwitchMap(signerChangeTrigger$$),
  switchMap(x => x.web3Provider$),
  safeMap(x => x.getSigner(), { silent: true, project: null }),
)

const withAddress: OperatorFunction<JsonRpcSigner, readonly [JsonRpcSigner, string | null]> = pipe(
  combineLatestSwitchMap(x =>
    of(x).pipe(
      safeSwitchMap(x => x.getAddress(), { silent: true, project: null }),
      map(s => (s?.length ? s : null)),
    ),
  ),
)

export const mapToValidSigner: OperatorFunction<Web3ProviderMetadata, JsonRpcSigner | null> = pipe(
  mapToSigner,
  switchSome(
    withAddress,
    map(([signer, address]) => (signer && address ? signer : null)),
  ),
)

export const mapToSignerAddress: OperatorFunction<Web3ProviderMetadata, string | null> = pipe(
  mapToSigner,
  switchSome(
    withAddress,
    map(([, address]) => address),
  ),
)
