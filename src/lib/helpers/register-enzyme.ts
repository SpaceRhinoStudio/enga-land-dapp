import Enzyme from 'enzyme'
import { JSDOM } from 'jsdom'

require.extensions['.svg'] = () => {
  //ignore
}

// https://enzymejs.github.io/enzyme/docs/guides/jsdom.html

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom

;['.css', '.scss', '.png', '.jpg'].forEach(ext => {
  require.extensions[ext] = () => null
})

function copyProps(src: unknown, target: unknown) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  })
}

// @ts-expect-error official documentation
global.window = window
global.document = window.document
// @ts-expect-error official documentation
global.navigator = {
  userAgent: 'node.js',
}
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0)
}
global.cancelAnimationFrame = function (id) {
  clearTimeout(id)
}
copyProps(window, global)
