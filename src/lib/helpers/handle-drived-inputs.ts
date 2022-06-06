import type { InputControl } from '$lib/Input.svelte'
import { controlStreamPayload } from '$lib/operators/control-stream-payload'
import { keysOf } from '$lib/utils/type-safe'
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  ReplaySubject,
  Subject,
  withLatestFrom,
  type OperatorFunction,
} from 'rxjs'

/**
 * ## Example
 * ```ts
 * const derivations = {
 *      base: {
 *          quote: pipe(map(x => x.trim())),
 *      },
 *      quote: {
 *          base: pipe(map(x=> x.toUpperCase())),
 *      }
 * }
 * ```
 * the above derivation mapping tells the hook to update "base" every time "quote" is changed, with the "quote" value mapped to its trimmed version
 * also it tells the hook to update "quote" with the uppercase version of "base" value.
 * avoid mapping a derivation between a certain control and itself, handle those cases with the sanitizer|formatter|validator|parser operators on the input component.
 * never change the content of the derivations object because it will lead to hooks not being run in the same order as before
 */
export function handleDerivedInputs<K extends string>(
  controls: { [x in K]: Subject<InputControl> },
  derivations: { [x in K]?: { [x in K]?: OperatorFunction<string, string> } },
): { reset: () => void } {
  const lastModified$ = new ReplaySubject<{ Modified: K | undefined | null }>()

  merge(
    ...keysOf(controls).map(key =>
      controls[key].pipe(
        controlStreamPayload('LastKeyStroke'),
        distinctUntilChanged(),
        map(() => key),
      ),
    ),
  )
    .pipe(map(x => ({ Modified: x })))
    .subscribe(x => lastModified$.next(x))

  lastModified$.subscribe(x => console.log('lastModified', x))

  lastModified$.next({ Modified: undefined })

  for (const base of keysOf(derivations)) {
    for (const quote of keysOf(derivations[base])) {
      controls[quote]
        .pipe(
          controlStreamPayload('Value'),
          withLatestFrom(lastModified$),
          filter(([, last]) => last.Modified !== base && last.Modified !== null),
          map(([x]) => x),
          derivations[base]![quote]!,
          map(x => ({ Value: x })),
        )
        .subscribe(x => controls[base].next(x))
    }
  }

  const reset = () => {
    lastModified$.next({ Modified: null })
    for (const key of keysOf(derivations)) {
      controls[key].next({ Value: '' })
    }
    lastModified$.next({ Modified: undefined })
  }

  return { reset }
}
