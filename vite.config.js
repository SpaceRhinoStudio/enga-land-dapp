import { sveltekit } from '@sveltejs/kit/vite'
import svg from '@poppanator/sveltekit-svg'

const production = process.env.NODE_ENV === 'production'

const svgPlugin = svg({
  includePaths: ['./src/assets/', './src/lib/shared/assets'],
  svgoOptions: {
    multipass: true,
    plugins: [
      'removeXMLNS',
      'minifyStyles',
      'removeDimensions',
      'prefixIds',
      'convertStyleToAttrs',
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            removeUselessStrokeAndFill: false,
            removeUnknownsAndDefaults: false,
            cleanupIDs: false,
          },
        },
      },
      // { name: 'removeAttrs', params: { attrs: '(fill|stroke)' } },
    ],
  },
})

/** @type {import('vite').UserConfig} */
export default {
  server: {
    fs: {
      allow: !production ? ['contracts'] : [],
    },
  },
  plugins: [
    sveltekit(),
    //@ts-ignore
    svgPlugin,
  ],
}
