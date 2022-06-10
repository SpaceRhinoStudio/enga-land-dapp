import { config } from '$lib/configs'
import { isSentinel, SENTINEL } from '$lib/shared/contexts/empty-sentinel'
import { flashToast$ } from '$lib/contexts/flash-toast'
import { __$ } from '$lib/shared/locales'
import _ from 'lodash'
import { controlStreamPayload } from '$lib/operators/control-stream-payload'
import { passUndefined } from '$lib/operators/pass-undefined'
import { reEmitUntilChanged } from '$lib/operators/repeat-on-trigger'
import { withUpdatesFrom } from '$lib/operators/with-updates-from'
import {
  catchError,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  withLatestFrom,
  filter,
  tap,
  observeOn,
  asyncScheduler,
} from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { noSentinel } from '$lib/utils/no-sentinel-or-undefined'
import { SelectedWeb3Signer$, signerAddress$ } from './selected-web3-provider'
import { selectedNetwork$ } from './web3-network'
export const termsAndConditionsAgreementsController$: Subject<
  Partial<{ Signature: string; Loading: boolean; Request: true }>
> = new Subject()

type TermsAndConditionsMessageApiResponse = {
  data: {
    tos: string
    version: number
  }
}

termsAndConditionsAgreementsController$
  .pipe(
    observeOn(asyncScheduler),
    controlStreamPayload('Request'),
    tap(() => termsAndConditionsAgreementsController$.next({ Loading: true })),
    withLatestFrom(SelectedWeb3Signer$),
    map(([, x]) => x),
    passUndefined(
      switchMap(x =>
        ajax<TermsAndConditionsMessageApiResponse>({
          method: 'GET',
          url: `${config.apiAddress}/tos`,
        }).pipe(map(res => [x, res.response.data] as const)),
      ),

      switchMap(([x, { tos }]) => x.signMessage(tos).catch(() => undefined)),
    ),
    passUndefined(map(x => ({ Signature: x }))),
    tap(() => termsAndConditionsAgreementsController$.next({ Loading: false })),
  )
  .subscribe(x => {
    x && termsAndConditionsAgreementsController$.next(x)
  })

type TermsAndConditionsApiResponse = {
  success: boolean
}

export const termsAndConditionsAgreements$: Observable<boolean | undefined> = signerAddress$.pipe(
  passUndefined(
    reEmitUntilChanged(
      termsAndConditionsAgreementsController$.pipe(
        controlStreamPayload('Signature'),
        tap(() =>
          termsAndConditionsAgreementsController$.next({
            Loading: true,
          }),
        ),
        withLatestFrom(selectedNetwork$),
        switchMap(([x, network]) =>
          ajax({
            method: 'POST',
            url: `${config.apiAddress}/tos/sign`,
            body: {
              signature: x,
              network: config.Chains[network].id.toString(),
            },
          }).pipe(
            map(x => (x.status === 201 || x.status === 200 ? true : SENTINEL)),
            catchError(() => of(SENTINEL)),
            tap(
              x =>
                isSentinel(x) &&
                __$.subscribe(__ => flashToast$.next(__.web3Provider.submittingSignatureFailed)),
            ),
            tap(() =>
              termsAndConditionsAgreementsController$.next({
                Loading: false,
              }),
            ),
            filter(noSentinel),
          ),
        ),
      ),
    ),
    withUpdatesFrom(selectedNetwork$),
    switchMap(([address, network]) =>
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
)
