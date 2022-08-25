/**
 * @description this helper script is used to initialize `mocha` environment for testing.
 */

import chai from 'chai'
import chaiShallowDeepEqual from 'chai-shallow-deep-equal'
import chaiAsPromised from 'chai-as-promised'
import { JSDOM } from 'jsdom'

chai.use(chaiShallowDeepEqual)
chai.use(chaiAsPromised)
const projectDir = process.cwd()

;['.css', '.scss', '.png', '.jpg', '.svg'].forEach(ext => {
  require.extensions[ext] = () => null
})

function copyProps(src: unknown, target: unknown) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  })
}

const jsdom = new JSDOM(`
<!doctype html>
<html>
<head>
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js" defer></script>
</head>
<body>
</body>
</html>
`)
const { window } = jsdom

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
