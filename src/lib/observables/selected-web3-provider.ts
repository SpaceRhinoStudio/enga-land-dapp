/**@description these are a set of helpers designed to ease the connecting process for web3 injected providers */

import { config } from '$lib/configs'
import { localCache } from '$lib/contexts/local-cache'
import _ from 'lodash'
import { mapToProviderMeta } from '$lib/operators/web3/provider'
import { switchSome } from '$lib/operators/pass-undefined'
import {
  asyncScheduler,
  distinctUntilChanged,
  map,
  observeOn,
  shareReplay,
  Subject,
  switchMap,
  catchError,
  of,
  from,
  merge,
  delay,
  filter,
  mergeMap,
  scan,
  EMPTY,
  tap,
  take,
  BehaviorSubject,
} from 'rxjs'
import { Option, Option$, Web3ProviderId } from '$lib/types'
import type { Web3ProviderMetadata } from '$lib/types/rxjs'
import { mapToSigner } from '$lib/operators/web3/signer'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { controlStreamPayload, setLoadingForId } from '$lib/shared/operators/control-stream-payload'
import { evaluateProvider } from '$lib/operators/web3/wallet-connect'
import { isEnumMember } from '$lib/utils/enum'
import { onlineStatus$ } from '$lib/shared/observables/window'
import { getSyncSubjectValue } from '$lib/utils/get-subject-value'
import { safeSwitchMap } from '$lib/operators/safe-throw'
import { noNil, noUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'
import { inferWeb3Error, Web3Errors } from '$lib/helpers/web3-errors'
import { evaluateNetwork } from '$lib/operators/web3/network'
import { defaultNetwork, networkController$, selectedNetwork$ } from './web3-network'

export const web3ProviderIdController$ = new Subject<
  Partial<{
    Request: Option<string>
    Loading: boolean | { id: string; value: boolean }
  }>
>()
const loadings: Record<string, boolean> = {}

const setLoading = setLoadingForId(web3ProviderIdController$)

export const isLoadingWeb3Provider$ = web3ProviderIdController$.pipe(
  // observeOn(asyncScheduler),
  controlStreamPayload('Loading'),
  mergeMap(x => {
    let res = _.isBoolean(x) ? x : null
    if (!_.isBoolean(x)) {
      res = x.value && !loadings[x.id] ? true : !x.value && loadings[x.id] ? false : null
      if (_.isBoolean(res)) {
        //side effect
        loadings[x.id] = res
      }
    }
    return res === true ? of(1) : res === false ? of(-1) : EMPTY
  }),
  scan((acc, x) => acc + x, 0),
  map(x => !!x),
  shareReplay(1),
)

const isValidProviderId = isEnumMember(Web3ProviderId)

const requests$ = merge(
  web3ProviderIdController$.pipe(
    controlStreamPayload('Request'),
    map(id => (_.isString(id) && isValidProviderId(id) ? id : null)),
    mapToProviderMeta,
  ),
).pipe(shareReplay(1))

export const currentWeb3Provider$: Option$<Web3ProviderMetadata> = merge(
  requests$.pipe(
    setLoading('connecting', true),
    evaluateProvider,
    catchError((e, o) => {
      if (inferWeb3Error(e) === Web3Errors.REJECTED) {
        web3ProviderIdController$.next({ Request: null })
      }
      console.warn(e)
      return of(undefined).pipe(
        delay(2000),
        switchMap(() => onlineStatus$),
        filter(x => x),
        switchMap(() => o),
      )
    }),
    setLoading('connecting', false),
    evaluateNetwork(
      selectedNetwork$,
      network => networkController$.next({ Request: network }),
      defaultNetwork,
      setLoading,
    ),
  ),
  isLoadingWeb3Provider$.pipe(
    filter(x => x),
    map(() => undefined),
  ),
).pipe(distinctUntilChanged(), shareReplay(1))

const lastRequestedProvider$ = new BehaviorSubject<Option<Web3ProviderMetadata>>(null)
web3ProviderIdController$
  .pipe(
    controlStreamPayload('Request'),
    map(id => (_.isString(id) && isValidProviderId(id) ? id : null)),
    mapToProviderMeta,
    filter(noNil),
  )
  .subscribe(lastRequestedProvider$)

currentWeb3Provider$
  .pipe(
    tap(
      x =>
        x === null &&
        lastRequestedProvider$
          .pipe(
            take(1),
            filter(noNil),
            switchMap(x => x.provider$),
            take(1),
          )
          .subscribe(currentExternalProvider => {
            console.debug('disconnecting')
            lastRequestedProvider$.next(null)
            // const disconnect = _.get(currentExternalProvider, 'disconnect')
            const connector = _.get(currentExternalProvider, 'connector')
            const killSession = _.get(connector, 'killSession')
            const emit = _.get(currentExternalProvider, 'emit')
            if (_.isFunction(killSession)) {
              of(undefined)
                .pipe(safeSwitchMap(killSession.bind(connector), { project: null }))
                .subscribe(() => {
                  console.log('doing error')
                  if (_.isFunction(emit)) {
                    console.log('doing error 2')
                    emit.bind(currentExternalProvider)('error')
                  }
                })
            }
          }),
    ),
  )
  .subscribe()

export const currentWeb3ProviderId$: Option$<Web3ProviderId> = currentWeb3Provider$.pipe(
  switchSome(map(x => x.id)),
  shareReplay(1),
)

const storage = localCache.observe<Option<string>>(config.Web3ProviderIdCacheKey, null)

storage
  .pipe(
    observeOn(asyncScheduler),
    distinctUntilChanged(),
    filter(x => x !== getSyncSubjectValue(currentWeb3ProviderId$)),
    distinctUntilChanged(),
    map(x => ({ Request: x })),
  )
  .subscribe(web3ProviderIdController$)

currentWeb3ProviderId$.pipe(distinctUntilChanged(), filter(noUndefined)).subscribe(storage)

export const currentSigner$: Option$<JsonRpcSigner> = currentWeb3Provider$.pipe(
  switchSome(mapToSigner),
  shareReplay(1),
)

export const currentValidSigner$: Option$<JsonRpcSigner> = currentSigner$.pipe(
  switchSome(
    switchMap(x => {
      try {
        return !_.isEmpty(x._address)
          ? of(x)
          : from(x.getAddress()).pipe(
              map(add => (_.isEmpty(add) ? null : x)),
              catchError(e => {
                console.warn(e)
                return of(null)
              }),
            )
      } catch (e) {
        console.warn(e)
        return of(null)
      }
    }),
  ),
  shareReplay(1),
)

export const signerAddress$: Option$<string> = currentValidSigner$.pipe(
  switchSome(
    safeSwitchMap(
      x =>
        !_.isEmpty(x._address)
          ? of(x._address)
          : from(x.getAddress()).pipe(map(add => (_.isEmpty(add) ? null : add))),
      { silent: true, project: null },
    ),
  ),
  shareReplay(1),
)
