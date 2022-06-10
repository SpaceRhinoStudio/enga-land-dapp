import { Window$ } from '$lib/shared/observables/window'
import { map, shareReplay } from 'rxjs'

export const isFirefox$ = Window$.pipe(
  map(() => !CSS.supports('backdrop-filter', 'blur(1px)')),
  shareReplay(1),
)
