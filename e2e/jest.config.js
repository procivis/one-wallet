/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  maxWorkers: 1,
  reporters: [
    'detox/runners/jest/reporter',
    [
      'jest-junit',
      {
        ancestorSeparator: ' > ',
        outputName: 'detox-junit.xml',
        suiteName: 'Detox E2E',
        titleTemplate: '{classname} > {title}',
      },
    ],
  ],
  rootDir: '..',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts'],
  testTimeout: 120000,
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?node-fetch|fetch-blob|formdata-polyfill|data-uri-to-buffer)',
  ],
  verbose: true,
};
