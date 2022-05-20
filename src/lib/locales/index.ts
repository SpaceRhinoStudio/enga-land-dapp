import { WebsiteLocale, type WebsiteLocaleData } from './interface'
import {
  asapScheduler,
  BehaviorSubject,
  catchError,
  map,
  mergeMap,
  observeOn,
  of,
  ReplaySubject,
  tap,
  throwError,
  timer,
} from 'rxjs'
import { ObservableError } from '$lib/classes/observable-error'
import { flashToast$ } from '$lib/contexts/flash-toast'
import _ from 'lodash'

export const __$ = new ReplaySubject<WebsiteLocaleData>(1)
export const locale$ = new BehaviorSubject<string>('en')

const localeImportMaps = {
  en: () => import('./en'),
}

locale$
  .pipe(
    mergeMap(_locale => _.get(localeImportMaps, _locale)?.()),
    map(x => _.get(x, 'default')),
    mergeMap(x =>
      x instanceof WebsiteLocale
        ? of(x)
        : throwError(
            () => new ObservableError(`E0x02 invalid locale data for ${locale$.getValue()}`),
          ),
    ),
    catchError((err, observable) => {
      flashToast$.next(
        `${err?.toString?.() ?? 'E0x03 error loading locale data'}, trying to load fallback locale`,
      )
      locale$.next('en')
      return observable.pipe(observeOn(asapScheduler))
    }),
    map(x => x.data),
  )
  .subscribe(__$)
