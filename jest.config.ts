import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testMatch: ['<rootDir>/src/**/test/unit/**/*.spec.ts'],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/presentation/**/*.ts',
    '!src/**/infra/database/**/*.ts',
    '!src/**/config/**/*.ts',
    '!**/*.module.ts'
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 }
  }
};

export default config;
