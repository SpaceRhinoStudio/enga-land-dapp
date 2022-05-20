export function resize_observer(node: HTMLElement): { destroy: () => void } {
  const observer = new ResizeObserver(([entry]) => {
    if (entry) {
      node.dispatchEvent(
        new CustomEvent('resize', {
          detail: {
            left: entry.contentRect.left,
            top: entry.contentRect.top,
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            scrollHeight: entry.target.scrollHeight,
            scrollWidth: entry.target.scrollWidth,
            paddingX: (entry.target as HTMLElement).offsetWidth - entry.contentRect.width,
            paddingY: (entry.target as HTMLElement).offsetHeight - entry.contentRect.height,
          },
        }),
      )
    }
  })

  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
    },
  }
}
