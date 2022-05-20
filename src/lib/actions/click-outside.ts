export function outclick(node: HTMLElement): { destroy: () => void } {
  const listener = (e: MouseEvent) => {
    if (node && !node.contains(e.target as Node) && !e.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('outclick'))
    }
  }

  document.addEventListener('click', listener, true)

  return {
    destroy() {
      document.removeEventListener('click', listener, true)
    },
  }
}
