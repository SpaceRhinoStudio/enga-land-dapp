import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import svg from '@poppanator/sveltekit-svg'

const svgPlugin = svg({
  includePaths: ['./src/assets/'],
  svgoOptions: {
    multipass: true,
    plugins: [
      'removeXMLNS',
      'minifyStyles',
      'removeDimensions',
      'prefixIds',
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

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
      typescript: true,
    }),
  ],

  kit: {
    adapter: adapter(),

    vite: {
      plugins: [
        //@ts-ignore
        svgPlugin,
      ],
    },
  },
}

export default config
