import { Window$ } from '$lib/observables/window'
import {
  fromEvent,
  map,
  mergeMap,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  throwError,
} from 'rxjs'

function getPxPerRem() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export const pxPerRem$ = Window$.pipe(
  switchMap(win =>
    fromEvent(win, 'resize').pipe(
      map(() => getPxPerRem()),
      startWith(getPxPerRem()),
    ),
  ),
  startWith(16),
  shareReplay(1),
)

export function toPx$(rem: string): Observable<{ px: number; rate: number }> {
  return pxPerRem$.pipe(
    mergeMap(pxPerRem => {
      if (rem.endsWith('px')) {
        return of({ px: parseFloat(rem), rate: pxPerRem })
      }
      if (!rem.endsWith('rem')) {
        return throwError(() => new Error('only px and rem are supported for unit conversion'))
      }
      return of({ px: parseFloat(rem) * pxPerRem, rate: pxPerRem })
    }),
  )
}

export function exclusiveOf$(dimension: string): Observable<string> {
  return toPx$(dimension).pipe(
    mergeMap(({ px, rate }) => {
      if (dimension.endsWith('px')) {
        return of(`${parseFloat(dimension) - 1}px`)
      }
      if (dimension.endsWith('rem')) {
        return of(`${(px - 1) / rate}rem`)
      }
      return throwError(() =>
        Error('only px and rem units are supported for media queries for now'),
      )
    }),
  )
}
