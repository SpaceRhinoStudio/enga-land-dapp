export function outclick(node: HTMLElement): { destroy: () => void } {
  const listener = (e: MouseEvent) => {
    if (node && !node.contains(e.target as Node) && !e.defaultPrevented) {
      e.stopPropagation()
      e.preventDefault()
      e.stopImmediatePropagation()
      node.dispatchEvent(new CustomEvent('outclick'))
      return false
    }
  }

  document.addEventListener('click', listener, true)

  return {
    destroy() {
      document.removeEventListener('click', listener, true)
    },
  }
}
