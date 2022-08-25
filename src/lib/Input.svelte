<script lang="ts" context="module">
  export const inputControlFactory = () =>
    useCreateControl<InputControl>({ omit: ['LastKeyStroke', 'Reset'] })
</script>

<script lang="ts">
  import _ from 'lodash'
  import cn from 'classnames'
  import {
    asyncScheduler,
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    map,
    observeOn,
    pipe,
    startWith,
    subscribeOn,
    throttleTime,
    type OperatorFunction,
    type Subject,
  } from 'rxjs'

  import { onDestroy, tick } from 'svelte'
  import { controlStreamPayload } from './shared/operators/control-stream-payload'
  import SvgIcon from './shared/SVGIcon.svelte'
  import LoadingOverlay from './shared/LoadingOverlay.svelte'
  import { fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { waitFor } from './shared/helpers/wait-for'
  import { pulse } from './shared/actions/pulse'
  import type { InputComponentError, InputControl } from './input'
  import { useCreateControl } from './helpers/create-control'
  import { isArray, isEqual } from './shared/utils/type-safe'
  import { pipeIfNot } from './operators/pipe-if-not'
  import { isSentinel } from './shared/contexts/empty-sentinel'

  export let control$: Subject<InputControl> = inputControlFactory()
  export let validators: OperatorFunction<string, InputComponentError>[] = []
  export let formatter: OperatorFunction<string, string> = x => x
  export let parser: OperatorFunction<string, string> = x => x //TODO: use this maybe?
  export let sanitizer: OperatorFunction<string, string> = x => x
  export let disabled = false
  export let value = undefined as string | undefined
  export let className: { [key in 'outer' | 'wrapper' | 'target']?: string } = {}
  export let icon: any | undefined = undefined
  export let options: svelte.JSX.HTMLAttributes<HTMLInputElement> = {}

  control$.pipe(controlStreamPayload('Reset')).subscribe(() => (value = undefined))
  $: !_.isNil(value) && control$.next({ Value: value })
  $: control$.next({ Disable: disabled })
  control$.pipe(controlStreamPayload('Value')).subscribe(x => (value = x))

  const validatorSub = combineLatest(
    validators.map(validator =>
      control$.pipe(
        observeOn(asyncScheduler),
        controlStreamPayload('Value'),
        distinctUntilChanged(),
        validator,
        startWith(undefined),
        throttleTime(100, undefined, { leading: true, trailing: true }),
      ),
    ),
  )
    .pipe(
      map(x => x.filter(x => !_.isEmpty(x))),
      map(x => ({ Errors: x })),
    )
    .subscribe(x => control$.next(x))

  const valueSub = control$
    .pipe(
      subscribeOn(asyncScheduler),
      controlStreamPayload(['Value', 'Reset']),
      distinctUntilChanged(isEqual),
      pipeIfNot(
        map(([val, reset]) => !isSentinel(reset) || _.isEmpty(val) || isSentinel(val)),
        pipe(
          map(([x]) => x as string),
          sanitizer,
          formatter,
        ),
      ),
      map(x => (isArray(x) ? '' : x)),
      map(x => ({ Value: x })),
    )
    .subscribe(x => control$.next(x))

  const shouldPulse$ = new BehaviorSubject(disabled)
  $: pulseSub = control$.pipe(controlStreamPayload('Disable')).subscribe(x => shouldPulse$.next(x))

  onDestroy(() => {
    valueSub.unsubscribe()
    validatorSub.unsubscribe()
    pulseSub.unsubscribe()
  })

  let focused = false
  let state: {
    cursorStart: number | null
    cursorEnd: number | null
    set: (
      start: number | null,
      end: number | null,
      direction?: 'forward' | 'backward' | 'none' | undefined,
    ) => void
    val: string
  } = {
    cursorStart: 0,
    cursorEnd: 0,
    set: () => {},
    val: value ?? '',
  }
  let offset = 0
</script>

<div
  use:pulse={{ should$: shouldPulse$ }}
  class={cn(
    'relative children:transition-opacity',
    $$slots.label && 'table-row',
    $control$?.Disable && 'brightness-75 cursor-not-allowed',
    className?.outer,
  )}>
  {#if $$slots.label}
    <span class={cn('table-cell align-middle pr-2', $control$?.Loading && 'opacity-20')}>
      <slot name="label" />
      <span>:</span>
    </span>
  {/if}
  <div
    class={cn(
      $$slots.label && 'table-cell align-middle',
      className?.wrapper,
      'relative transition-all',
      $control$?.Loading && 'opacity-20',
    )}>
    {#if icon}
      <SvgIcon
        Icon={icon}
        width={'1.2rem'}
        height={'1.2rem'}
        className={cn('absolute top-1/2 -translate-y-1/2 left-4 md:left-3')} />
    {/if}
    <input
      {...options}
      class={cn(
        'disabled:bg-primary-900 disabled:bg-opacity-80 disabled:border-transparent disabled:cursor-not-allowed',
        'w-full',
        'h-12 md:h-10',
        'border bg-primary-800 rounded-lg py-1 outline-none',
        'transition-all',
        _.isEmpty($control$?.Errors)
          ? 'border-primary-600 focus:border-neutral-300'
          : 'border-blood focus:border-rose-500',
        icon ? 'pl-11 pr-2' : 'px-2',
        className?.target,
      )}
      disabled={$control$?.Disable}
      bind:value
      on:keydown={e => {
        control$.next({ LastKeyStroke: e.code })
      }}
      on:focus={() => (focused = true)}
      on:blur={() => (focused = false)}
      on:beforeinput={e => {
        state = {
          cursorStart: e.currentTarget.selectionStart,
          cursorEnd: e.currentTarget.selectionEnd,
          set: e.currentTarget.setSelectionRange.bind(e.currentTarget),
          val: e.currentTarget.value,
        }
        offset = 0
        tick()
          .then(() => waitFor(0))
          .then(() => {
            offset = (value?.length ?? 0) - (state.val.length ?? 0)
          })
      }}
      on:input={e => {
        tick()
          .then(() => waitFor(0))
          .then(() => {
            state.set((state.cursorEnd ?? 0) + offset, (state.cursorEnd ?? 0) + offset)
          })
      }} />
    <div class="absolute right-0 top-1/2 -translate-y-1/2 ">
      <slot name="right" />
    </div>
  </div>
  {#if $control$?.Errors?.length && focused}
    <div class="absolute -top-2 left-0 right-0 -translate-y-full flex flex-col items-center gap-1">
      {#each $control$?.Errors ?? [] as x (x)}
        <div
          animate:flip
          transition:fly={{ y: 50 }}
          class="text-rose-500 bg-[#300] px-5 py-2 leading-none rounded-lg shadow-floatStrong">
          {x}
        </div>
      {/each}
    </div>
  {/if}
  <LoadingOverlay visible={!!$control$?.Loading} />
</div>
