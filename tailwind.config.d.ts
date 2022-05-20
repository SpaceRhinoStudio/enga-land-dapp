import { TailwindConfig } from 'tailwindcss/tailwind-config'
import { Screens, ValueTypeOfKey } from './src/lib/types'

type TailwindConfigJIT = TailwindConfig & { mode?: 'jit' }

type theme = ValueTypeOfKey<TailwindConfigJIT, 'theme'>

type Spacings =
  | '0'
  | 'px'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '2.5'
  | '3'
  | '3.5'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '36'
  | '40'
  | '44'
  | '48'
  | '52'
  | '56'
  | '60'
  | '64'
  | '72'
  | '80'
  | '96'

export type ThemeConfig = Omit<theme, 'screens'> & {
  screens: { [x in Screens]: string }
  spacing: { [x in Spacings]: string }
} & {
  extend: {
    colors: {
      primary: {
        DEFAULT: string
        50: string
        500: string
        600: string
        700: string
        800: string
        900: string
        990: string
      }
      secondary: {
        DEFAULT: string
        50: string
        100: string
        200: string
        300: string
        400: string
        500: string
        600: string
        700: string
        800: string
        900: string
      }
      blood: {
        DEFAULT: string
      }
      shiningOrange: {
        DEFAULT: string
        500: string
        faded: string
      }
      rarity: {
        common: string
        uncommon: string
        rare: string
        legendary: string
        mythical: string
        celestial: string
      }
      text: {
        primary: string
        secondary: string
        hover: string
      }
    }
  }
}
