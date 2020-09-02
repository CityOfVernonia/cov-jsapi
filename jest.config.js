module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    'esri/(.*)': '<rootDir>/__mock.ts',
  },
};