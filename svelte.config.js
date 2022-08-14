// import adapter from '@sveltejs/adapter-auto'
import adapter from '@sveltejs/adapter-cloudflare'
import preprocess from 'svelte-preprocess'

// const babelConfig = {
//   presets: [
//     [
//       '@babel/preset-env',
//       {
//         loose: true,
//         modules: false,
//         targets: {
//           esmodules: true,
//         },
//       },
//     ],
//     '@babel/preset-typescript',
//   ],
//   plugins: [
//     '@babel/plugin-proposal-async-generator-functions',
//     '@babel/plugin-transform-async-to-generator',
//   ],
// }

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
      // typescript: true,
      // babel: babelConfig,
      // sourceMap: true,
    }),
  ],
  kit: {
    adapter: adapter(),
  },
}

export default config
