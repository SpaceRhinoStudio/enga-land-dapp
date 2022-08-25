<script lang="ts">
  import _ from 'lodash'
  import { filter, map, scan, tap, BehaviorSubject, withLatestFrom } from 'rxjs'
  import cn from 'classnames'
  import OpifexOpeningEndroItem from '$lib/opifex-opening/OpifexOpeningEndroItem.svelte'
  import { __$ } from '$lib/shared/locales'
  import { slider } from '$lib/shared/actions/slider'
  import { noSentinelOrUndefined } from '$lib/shared/utils/no-sentinel-or-undefined'
  import { EndroMeta } from '$lib/types/enga'

  export let prev: () => void
  export let next: () => void
  export let curr: number
  export let endros: EndroMeta[]
  export let selected: boolean

  const slidePercent$ = new BehaviorSubject<number>(50)
  const slideStatus$ = new BehaviorSubject<'start' | 'end'>('end')
  slidePercent$
    .pipe(
      withLatestFrom(slideStatus$),
      scan(
        (acc, [percent, status]) =>
          status === 'start'
            ? acc.start === undefined
              ? { start: percent }
              : Math.abs(acc.start - percent) > 20
              ? { move: Math.sign(acc.start - percent) as 1 | -1 }
              : { start: acc.start }
            : {},
        {} as { start?: number; move?: 1 | -1 },
      ),
      map(x => x.move),
      filter(noSentinelOrUndefined),
      tap(() => slideStatus$.next('end')),
      map(x => (x > 0 ? 'next' : 'prev')),
    )
    .subscribe(x => {
      if (x === 'next') {
        next()
      } else {
        prev()
      }
    })

  let containerWidth: number
</script>

<div
  bind:clientWidth={containerWidth}
  use:slider={{ disableTranslate: true, initial: 50 }}
  on:slider_change={e => slidePercent$.next(e.detail[0])}
  on:slider_status={e => slideStatus$.next(e.detail)}
  class="flex justify-start items-center gap-6 relative w-full">
  {#each endros as endro, i (endro.id)}
    <div
      style={cn(i === curr && `left: ${containerWidth / 2}px;`)}
      class={cn(
        i === curr ? 'relative' : 'absolute left-1/2',
        'transition-all duration-500',
        i === curr
          ? '-translate-x-1/2'
          : Math.abs(i - curr) === 1
          ? i - curr < 0
            ? '-translate-x-[150%]'
            : 'translate-x-1/2'
          : i - curr < 0
          ? '-translate-x-[200%]'
          : 'translate-x-full',
        selected && i !== curr && 'blur-md',
        selected && i === curr && '-translate-y-2 scale-105',
      )}>
      <div
        style={cn(
          'transform:',
          'perspective(600px)',
          i !== curr && ['scale(0.75)', `rotateY(${i - curr < 0 ? -35 : 35}deg)`],
          ';',
        )}
        class={cn('transition-transform duration-500')}>
        <OpifexOpeningEndroItem meta={endro} selected={i === curr && selected} />
      </div>
    </div>
  {/each}

  <!-- left and right hints -->
  <div
    class="fix-z-index w-1/4 absolute -left-5 top-0 bottom-0 bg-gradient-to-r to-transparent pointer-events-none select-none from-primary-800" />
  <div
    class="fix-z-index w-1/4 absolute -right-5 top-0 bottom-0 bg-gradient-to-l to-transparent pointer-events-none select-none from-primary-800" />
</div>

<style>
  .fix-z-index {
    transform: translateZ(0.5rem);
  }
</style>
