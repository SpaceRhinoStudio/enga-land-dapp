declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onresize?: (e: CustomEvent<import('./lib/shared/types').Bounds>) => void
    onintersection?: (e: CustomEvent<boolean>) => void
    onswipe_dismiss?: (e: CustomEvent<'left' | 'right'>) => void
    onslider_change?: (e: CustomEvent<[percent: number, px: number]>) => void
  }
}
