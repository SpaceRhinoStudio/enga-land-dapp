// import adapter from '@sveltejs/adapter-auto'
import adapter from '@sveltejs/adapter-cloudflare'
import preprocess from 'svelte-preprocess'
import svg from '@poppanator/sveltekit-svg'

const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-transform-async-to-generator',
  ],
}

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

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
      typescript: true,
      babel: babelConfig,
      sourceMap: true,
    }),
  ],
  kit: {
    adapter: adapter(),

    vite: {
      server: {
        fs: {
          allow: process.argv[2] === 'dev' ? ['contracts'] : [],
        },
      },
      plugins: [
        //@ts-ignore
        svgPlugin,
      ],
    },
  },
}

export default config
