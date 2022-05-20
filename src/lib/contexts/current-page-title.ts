import { config } from '$lib/configs'
import { __$ } from '$lib/locales'
import _ from 'lodash'
import { withUpdatesUntilChanged } from '$lib/operators/with-updates-from'
import { map, shareReplay, switchMap } from 'rxjs'
import { currentRoute$ } from './current-route'

function sanitizeRoute(route: string): string {
  return route.replace(/^\//, '').replace(/\/$/, '')
}

export const currentPageTitle$ = currentRoute$.pipe(
  map(x => sanitizeRoute(x)),
  map(x => _.values(config.routeConfig).find(route => sanitizeRoute(route.href) === x)),
  withUpdatesUntilChanged(__$),
  map(([x, __]) => (x ? __.nav[x.id] : __.nav.notFound)),
  shareReplay(1),
)
