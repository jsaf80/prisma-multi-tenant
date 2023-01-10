import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import * as path from 'path'
export default {
  testSequencer: './test-sequencer.js',
  testEnvironment: 'node',
  maxWorkers: '1',
  slowTestThreshold: 40,
  verbose: false,
  silent: false,
  testTimeout: 150000,
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/playground/example/',
    '<rootDir>/docs/',
  ],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    chalk: require.resolve('chalk'),
    '#ansi-styles': path.join(
      require.resolve('chalk').split('chalk')[0],
      'chalk/source/vendor/ansi-styles/index.js'
    ),
    '#supports-color': path.join(
      require.resolve('chalk').split('chalk')[0],
      'chalk/source/vendor/supports-color/index.js'
    ),
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
}
