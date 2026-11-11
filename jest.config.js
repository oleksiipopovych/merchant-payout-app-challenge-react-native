module.exports = {
  preset: 'jest-expo',
  // MSW's `msw/node` export is null under the `react-native` condition jest-expo uses,
  // so resolve package exports with Node conditions instead.
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-ng/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|msw|@mswjs/.*|until-async|rettime|@bundled-es-modules/.*|outvariant|strict-event-emitter|headers-polyfill|is-node-process|@open-draft/.*)',
  ],
  // mocks/server.test.ts is the MSW node server, not a test suite.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/mocks/server.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'features/**/*.{ts,tsx}',
    'api/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
