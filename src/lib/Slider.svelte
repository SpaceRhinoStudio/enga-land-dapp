<script lang="ts">
  import cn from 'classnames'
  import _ from 'lodash'
  import {
    asyncScheduler,
    combineLatest,
    distinctUntilChanged,
    map,
    OperatorFunction,
    pipe,
    Subject,
    subscribeOn,
    throttleTime,
  } from 'rxjs'
  import { get, writable } from 'svelte/store'
  import { fade } from 'svelte/transition'

  import Fade from './Fade.svelte'
  import type { InputComponentError, InputControl } from './input'
  import { inputControlFactory } from './Input.svelte'
  import { pulse } from './shared/actions/pulse'
  import { slider } from './shared/actions/slider'
  import LoadingOverlay from './shared/LoadingOverlay.svelte'
  import { controlStreamPayload } from './shared/operators/control-stream-payload'
  import ToolTip from './shared/ToolTip.svelte'
  import { sanitizeNumbers } from './utils/sanitize-numbers'

  export let isLoading = false

  export let control$: Subject<InputControl> = inputControlFactory()

  const sanitizer: OperatorFunction<string, string> = pipe(
    map(sanitizeNumbers),
    map(x => (Number(x) < 0 ? '0' : Number(x) > 100 ? '100' : x)),
  )

  export let validators: OperatorFunction<string, InputComponentError>[] = []
  export let percent = 0
  let x = 0

  let className: { [key in 'container']?: string } = {}
  export { className as class }

  export let disabled = false
  $: !_.isNil(percent) && control$.next({ Value: String(percent) })
  $: control$.next({ Disable: disabled })
  control$
    .pipe(controlStreamPayload('Value'))
    .subscribe(x => !_.isNaN(Number(x)) && (percent = Number(x)))

  combineLatest(
    validators.map(validator =>
      control$.pipe(
        controlStreamPayload('Value'),
        distinctUntilChanged(),
        // throttleTime(500, undefined, { leading: true, trailing: true }),
        validator,
      ),
    ) ?? [],
  )
    .pipe(
      map(x => x.filter(x => !_.isEmpty(x))),
      map(x => ({ Errors: x })),
    )
    .subscribe(x => control$.next(x))

  control$
    .pipe(
      subscribeOn(asyncScheduler),
      controlStreamPayload('Value'),
      distinctUntilChanged(),
      sanitizer,
      // formatter,
      map(x => ({ Value: x })),
    )
    .subscribe(x => control$.next(x))

  const percentStore = writable(percent)
  $: percentStore.set(percent)
  const disabledStore = writable(disabled)
  $: disabledStore.set(disabled)
</script>

<div
  use:pulse={{ should: disabled }}
  class={cn('relative transition-all w-full flex items-center h-full', className.container)}>
  {#if !isLoading}
    <div
      transition:fade
      class={cn('flex grow gap-4 items-center', disabled && 'saturate-0 brightness-50')}>
      <span> 0% </span>
      <div class={cn('flex items-center grow h-5 bg-transparent relative')}>
        <div class="w-full absolute top-1/2 -translate-y-1/2 h-0.5 bg-neutral-600 opacity-25 " />
        <div class={cn('relative grow h-full', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
          <ToolTip
            className={{ position: 'top-0 left-0' }}
            style="transform: translate(calc({x}px - 50%), var(--tw-translate-y));">
            {Number(percent).toLocaleString(undefined, { maximumFractionDigits: 0 })}%
          </ToolTip>
          <div
            use:slider={{ initial: percent, update: percentStore, disabled: disabledStore }}
            on:slider_change={e => {
              if (get(percentStore) !== e.detail[0]) {
                // if not updated externally
                control$.next({ LastKeyStroke: '1' })
              }
              ;[percent, x] = e.detail
            }}
            class="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-400 rounded-full w-4 h-4" />
          <div class="w-full absolute top-1/2 -translate-y-1/2 h-1.5 overflow-hidden rounded-full">
            <div
              style="transform: scaleX({x / 100});"
              class={cn('origin-left', 'w-[100px]', 'bg-yellow-400', 'h-1.5')} />
          </div>
        </div>
      </div>
      <span> 100% </span>
    </div>
  {/if}
  <LoadingOverlay visible={isLoading} />
</div>
