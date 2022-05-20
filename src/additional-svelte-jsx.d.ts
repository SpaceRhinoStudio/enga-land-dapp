declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onresize?: (e: CustomEvent<import('./lib/types').Bounds>) => void
  }
}
