module.exports = {
  env: {
    browser: false,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: ['**/*.test.ts', 'docs', 'node_modules', 'dist', 'tests', '.eslintrc.js'],
}
