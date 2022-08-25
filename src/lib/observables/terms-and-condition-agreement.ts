import { config } from '$lib/configs'
import { flashToast$ } from '$lib/shared/contexts/flash-toast'
import { __$ } from '$lib/shared/locales'
import _ from 'lodash'
import { controlStreamPayload, setLoadingFor } from '$lib/shared/operators/control-stream-payload'
import { mapNil, switchSome, switchSomeMembers } from '$lib/operators/pass-undefined'
import { reEvaluateSwitchMap } from '$lib/operators/re-evaluate'
import {
  catchError,
  map,
  of,
  Subject,
  withLatestFrom,
  filter,
  tap,
  observeOn,
  asyncScheduler,
  combineLatestWith,
  exhaustMap,
  merge,
} from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { noNil } from '$lib/shared/utils/no-sentinel-or-undefined'
import { currentSigner$, signerAddress$ } from './selected-web3-provider'
import { selectedNetwork$ } from './web3-network'
import type { Option$ } from '$lib/types'

export const termsAndConditionsAgreementsController$: Subject<
  Partial<{ Signature: string; Loading: boolean; Request: true; Submitted: boolean }>
> = new Subject()

type TermsAndConditionsMessageApiResponse = {
  data: {
    tos: string
    version: number
  }
}

const setLoading = setLoadingFor(termsAndConditionsAgreementsController$)

termsAndConditionsAgreementsController$
  .pipe(
    observeOn(asyncScheduler),
    controlStreamPayload('Request'),
    setLoading(true),
    withLatestFrom(currentSigner$),
    map(([, x]) => x),
    switchSome(
      exhaustMap(x =>
        ajax<TermsAndConditionsMessageApiResponse>({
          method: 'GET',
          url: `${config.apiAddress}/tos`,
        }).pipe(map(res => [x, res.response.data] as const)),
      ),
      exhaustMap(([x, { tos }]) => x.signMessage(tos).catch(() => null)),
    ),
    switchSome(map(x => ({ Signature: x }))),
    setLoading(false),
    mapNil(() => ({ Submitted: false })),
  )
  .subscribe(termsAndConditionsAgreementsController$)

termsAndConditionsAgreementsController$
  .pipe(
    observeOn(asyncScheduler),
    controlStreamPayload('Signature'),
    setLoading(true),
    withLatestFrom(selectedNetwork$),
    switchSomeMembers(
      exhaustMap(([x, network]) =>
        ajax({
          method: 'POST',
          url: `${config.apiAddress}/tos/sign`,
          body: {
            signature: x,
            network: config.Chains[network].id.toString(),
          },
        }).pipe(
          map(x => (x.status === 201 || x.status === 200 ? true : null)),
          catchError(() => of(null)),
        ),
      ),
    ),
    tap(
      x =>
        _.isNil(x) &&
        __$.subscribe(__ => flashToast$.next(__.web3Provider.submittingSignatureFailed)),
    ),
    setLoading(false),
    filter(noNil),
    map(() => ({ Submitted: true })),
  )
  .subscribe(termsAndConditionsAgreementsController$)

type TermsAndConditionsApiResponse = {
  success: boolean
}

export const termsAndConditionsAgreements$: Option$<boolean> = merge(
  termsAndConditionsAgreementsController$.pipe(
    controlStreamPayload('Loading'),
    filter(x => x),
    map(() => undefined),
  ),
  signerAddress$.pipe(
    setLoading(true),
    switchSome(
      reEvaluateSwitchMap(() =>
        termsAndConditionsAgreementsController$.pipe(controlStreamPayload('Submitted')),
      ),
      combineLatestWith(selectedNetwork$),
      switchSomeMembers(
        exhaustMap(([address, network]) =>
          ajax<TermsAndConditionsApiResponse>({
            method: 'GET',
            url: `${config.apiAddress}/tos/verify`,
            queryParams: {
              address,
              network: config.Chains[network].id.toString(),
            },
          }).pipe(
            map(x => x.response.success),
            catchError(() => of(false)),
          ),
        ),
      ),
    ),
    setLoading(false),
  ),
)
