// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
// const defaultConfig = require('tailwindcss/stubs/defaultConfig.stub')

/**@type {import('tailwindcss/tailwind-config').TailwindConfig} */
const config = {
  mode: 'jit',
  // important: false,
  content: ['./src/**/*.svelte', './src/**/*.html'],
  darkMode: true,
  theme: {
    extend: {
      boxShadow: {
        strong: '0 1.5rem 3rem -0.75rem rgb(0 0 0 / 1)',
        float: '0 0 3rem 0 rgb(0 0 0 / 0.25)',
        floatStrong: '0 0 0.5rem 0.25rem #0005',
        glow: '0 0 1.2rem 0.15rem',
      },
      colors: {
        primary: {
          DEFAULT: '#5F19E7',
          50: '#948F9F',
          // 100: '#B19DD8',
          // 200: '#A584E6',
          // 300: '#9263EF',
          500: '#5F19E7',
          600: '#302646',
          700: '#21153B',
          800: '#190D33',
          900: '#14082E',
          990: '#0D0127',
        },
        secondary: {
          DEFAULT: '#00DA86',
          50: '#D7FFF0',
          100: '#BBFFE5',
          200: '#83FFCF',
          300: '#4BFFBA',
          400: '#13FFA4',
          500: '#00DA86',
          600: '#00AC6A',
          700: '#007E4E',
          800: '#005031',
          900: '#002215',
        },
        blood: {
          DEFAULT: '#DA0037',
        },
        shiningOrange: {
          DEFAULT: '#EE5A24',
          500: '#EE5A24',
          faded: '#EE5A24C0',
        },
        rarity: {
          common: '#B2B2B2',
          uncommon: '#6A97DF',
          rare: '#7F46C8',
          legendary: '#D82BD8',
          mythical: '#EA4851',
          celestial: '#FFCD00',
        },
        text: {
          primary: '#ccc',
          secondary: '#948F9F',
          hover: '#fff',
        },
      },
      fontFamily: {
        sans: ['Poppins'],
        serif: ['Passion One'],
      },
      fontSize: {
        '2xs': '0.65rem',
        '2xll': '1.75rem',
      },
    },
    /**@type {{[x in import('./types').Screens]: string}} */
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '4xl': '2560px',
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
    require('tailwindcss-children'),
    require('tailwindcss/plugin')(({ addUtilities, addComponents, theme }) => {
      addUtilities({
        '.revert-tailwind-preflight': {
          '& blockquote,& dl,& dd,& h1,& h2,& h3,& h4,& h5,& h6,& hr,& figure,& p,& pre': {
            margin: 'revert',
          },
          '& h1,& h2,& h3,& h4,& h5,& h6': {
            fontSize: 'revert',
            fontWeight: 'revert',
          },
          '& ol,& ul': {
            listStyle: 'revert',
            margin: 'revert',
            padding: 'revert',
          },
          '& img,& svg,& video,& canvas,& audio,& iframe,& embed,& object': {
            display: 'revert',
            verticalAlign: 'revert',
          },
          '& *,& ::before,& ::after': {
            borderWidth: 'revert',
            borderStyle: 'revert',
            borderColor: 'revert',
          },
          '& .google-map *': {
            borderStyle: 'revert',
          },
          '& button:focus': {
            outline: 'revert',
          },
        },
      })
    }),
  ],
}
// eslint-disable-next-line no-undef
module.exports = config
