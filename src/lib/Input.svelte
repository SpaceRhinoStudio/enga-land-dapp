<script context="module" lang="ts">
  export type InputComponentError = string | undefined
  export type InputControl = Partial<{
    Disable: boolean
    Value: string
    Errors: InputComponentError[]
    Loading: boolean
    LastKeyStroke: string
  }>
</script>

<script lang="ts">
  import _ from 'lodash'
  import cn from 'classnames'
  import {
    asapScheduler,
    asyncScheduler,
    combineLatest,
    distinctUntilChanged,
    map,
    subscribeOn,
    throttleTime,
    type OperatorFunction,
    type Subject,
  } from 'rxjs'

  import { onDestroy, tick } from 'svelte'
  import { controlStreamPayload } from './operators/control-stream-payload'
  import SvgIcon from './shared/SVGIcon.svelte'
  import LoadingOverlay from './shared/LoadingOverlay.svelte'
  import { fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { waitFor } from './shared/helpers/wait-for'
  import { pulse } from './shared/actions/pulse'

  export let control$: Subject<InputControl>
  export let validators: OperatorFunction<string, InputComponentError>[] = []
  export let formatter: OperatorFunction<string, string> = x => x
  export let parser: OperatorFunction<string, string> = x => x //TODO: why this is not being used?
  export let sanitizer: OperatorFunction<string, string> = x => x
  export let disabled = false
  export let value = undefined as string | undefined
  export let className: { [key in 'outer' | 'wrapper' | 'target']?: string } = {}
  export let icon: any

  $: !_.isNil(value) && control$.next({ Value: value })
  $: control$.next({ Disable: disabled })
  control$.pipe(controlStreamPayload('Value')).subscribe(x => (value = x))

  combineLatest(
    validators.map(validator =>
      control$.pipe(
        controlStreamPayload('Value'),
        distinctUntilChanged(),
        throttleTime(500, undefined, { leading: true, trailing: true }),
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
      formatter,
      map(x => ({ Value: x })),
    )
    .subscribe(x => control$.next(x))

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
  use:pulse={{ should: $control$?.Disable ?? false }}
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
    <SvgIcon
      Icon={icon}
      width={'1.2rem'}
      height={'1.2rem'}
      className={cn('absolute top-1/2 -translate-y-1/2 left-4 md:left-3')} />
    <input
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
            state.set((state.cursorStart ?? 0) + offset, (state.cursorEnd ?? 0) + offset)
          })
      }} />
    <div class="absolute -right-1 top-1/2 -translate-y-1/2 ">
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
