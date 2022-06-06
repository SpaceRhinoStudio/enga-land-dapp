<script lang="ts">
  import { map } from 'rxjs'
  import { pxPerRem$, toPx$ } from './helpers/px-rem-conversion'

  export let className: { [key in 'container' | 'wrapper']?: string } = {}
  export let mode: 'inCutLeft' | 'outCutRight'
  export let cutHeight: string
  export let cornerRadius: string
  export let hScale: number = 1

  const cutHeight$ = toPx$(cutHeight).pipe(map(x => x.px))
  const cornerRadius$ = toPx$(cornerRadius).pipe(map(x => x.px))

  let height: number
  let width: number
  $: remFactor = $pxPerRem$ / 16

  $: clipPath =
    mode === 'inCutLeft'
      ? `path('M ${$cornerRadius$} 0 Q 0 0 0 ${$cornerRadius$} V ${
          (height - 50 * remFactor - $cutHeight$) / 2
        } q 0 ${8 * remFactor} ${5 * hScale * remFactor} ${13 * remFactor} l ${
          3 * hScale * remFactor
        } ${3 * remFactor} q ${4 * hScale * remFactor} ${4 * remFactor} ${4 * hScale * remFactor} ${
          9 * remFactor
        } v ${$cutHeight$} q 0 ${5 * remFactor} ${-4 * hScale * remFactor} ${9 * remFactor} l ${
          -3 * hScale * remFactor
        } ${3 * remFactor} q ${-5 * hScale * remFactor} ${5 * remFactor} ${
          -5 * hScale * remFactor
        } ${13 * remFactor} v ${
          (height - 50 * remFactor - $cutHeight$) / 2 - $cornerRadius$
        } q 0 ${$cornerRadius$} ${$cornerRadius$} ${$cornerRadius$} H ${
          width - $cornerRadius$
        } q ${$cornerRadius$} 0 ${$cornerRadius$} -${$cornerRadius$} V ${$cornerRadius$} q 0 -${$cornerRadius$} -${$cornerRadius$} -${$cornerRadius$} ')`
      : `path('M 0 ${$cornerRadius$} Q 0 0 ${$cornerRadius$} 0 H ${
          width - 12 * hScale * remFactor - $cornerRadius$
        } q ${$cornerRadius$} 0 ${$cornerRadius$} ${$cornerRadius$} V ${
          (height - 50 * remFactor - $cutHeight$) / 2
        } q 0 ${8 * remFactor} ${5 * hScale * remFactor} ${13 * remFactor} l ${
          3 * hScale * remFactor
        } ${3 * remFactor} q ${4 * hScale * remFactor} ${4 * remFactor} ${4 * hScale * remFactor} ${
          9 * remFactor
        } v ${$cutHeight$} q 0 ${5 * remFactor} ${-4 * hScale * remFactor} ${9 * remFactor} l ${
          -3 * hScale * remFactor
        } ${3 * remFactor} q ${-5 * hScale * remFactor} ${5 * remFactor} ${
          -5 * hScale * remFactor
        } ${13 * remFactor} v ${
          (height - 50 * remFactor - $cutHeight$) / 2 - $cornerRadius$
        } q 0 ${$cornerRadius$} -${$cornerRadius$} ${$cornerRadius$} H ${$cornerRadius$} q -${$cornerRadius$} 0 -${$cornerRadius$} -${$cornerRadius$}')`
</script>

<div class={className?.container ?? ''} style="clip-path: {clipPath};">
  <div class={className?.wrapper ?? ''} bind:clientHeight={height} bind:clientWidth={width}>
    <slot />
  </div>
</div>
