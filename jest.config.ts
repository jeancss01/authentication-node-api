module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  testTimeout: 10000,
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main/**'
  ],
  coverageDirectory: 'coverage',
  transform: {
    '.+\\.ts$': 'ts-jest'
  },
  coveragePathIgnorePatterns: [
    '.*-protocols\\.ts$',
    'presentation/protocols'
  ]
}
