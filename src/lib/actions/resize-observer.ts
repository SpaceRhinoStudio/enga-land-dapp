import _ from 'lodash'

export function resize_observer(
  node: HTMLElement,
  params?: { noop?: boolean },
): { destroy: () => void } {
  if (!params?.noop) {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        node.dispatchEvent(
          new CustomEvent('resize', {
            detail: {
              //TODO: figure this out
              left: entry.contentRect.left || node.getBoundingClientRect().left,
              top: entry.contentRect.top || node.getBoundingClientRect().top,
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
  return {
    destroy: _.noop,
  }
}
