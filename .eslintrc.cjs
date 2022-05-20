module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['svelte3', '@typescript-eslint'],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
  },
  ignorePatterns: ['node_modules/*', '*.config.js', '*.cjs'],
}
