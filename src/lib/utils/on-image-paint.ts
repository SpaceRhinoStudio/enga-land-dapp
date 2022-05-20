/** @description you should pass this to the onLoad event of the img element */
export function onImagePaint(cb: () => void): HTMLImageElement['onload'] {
  return function () {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.offsetWidth // force repaint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // done painting
            cb()
          })
        })
      })
    })
  }
}
