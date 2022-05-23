import { config } from '$lib/configs'
import { Window$ } from '$lib/observables/window'
import type { Screens } from '$lib/types'
import _ from 'lodash'
import { combineLatest, fromEvent, map, Observable, startWith, switchMap } from 'rxjs'
import { exclusiveOf$ } from './px-rem-conversion'

export function matchMedia$(query: string): Observable<boolean> {
  return Window$.pipe(
    switchMap(win => {
      const queryObject = win.matchMedia(query)
      return fromEvent<MediaQueryListEvent | MediaQueryList>(queryObject, 'change').pipe(
        map(x => x.matches),
        startWith(queryObject.matches),
      )
    }),
  )
}

export const canHover$ = matchMedia$('(hover: hover) and (pointer: fine)')

export function matchUntil$(screen: Screens): Observable<boolean> {
  return exclusiveOf$(config.Screens[screen]).pipe(
    switchMap(x => matchMedia$(`screen and (max-width: ${x})`)),
  )
}

export function matchBetween$(from: Screens, to: Screens): Observable<boolean> {
  return exclusiveOf$(config.Screens[to]).pipe(
    switchMap(x =>
      matchMedia$(`screen and (min-width: ${config.Screens[from]}) and (max-width: ${x})`),
    ),
  )
}

export function matchFrom$(screen: Screens): Observable<boolean> {
  return matchMedia$(`screen and (min-width: ${config.Screens[screen]})`)
}

export const deviceScreen$: Observable<'xs' | 'sm' | 'md' | 'lg'> = combineLatest({
  xs: matchUntil$('sm'),
  sm: matchBetween$('sm', 'md'),
  md: matchBetween$('md', 'lg'),
  lg: matchFrom$('lg'),
}).pipe(map(x => (x.xs ? 'xs' : x.sm ? 'sm' : x.md ? 'md' : 'lg')))
