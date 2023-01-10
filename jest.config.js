export default {
  testSequencer: './tests/playground/example/test-sequencer.js',
  preset: 'ts-jest',
  verbose: false,
  silent: false,
  testEnvironment: 'node',
  testTimeout: 150000,
  maxWorkers: '50%',
  slowTestThreshold: 120,
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/playground/example/',
    '<rootDir>/docs/',
    '/node_modules/',
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
}
