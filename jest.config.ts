import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },

  testMatch: ['<rootDir>/src/**/test/unit/**/*.spec.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage focado em Domain + Application (use-cases)
  collectCoverageFrom: [
    'src/modules/**/domain/**/*.ts',
    'src/modules/**/application/use-cases/**/*.ts',

    '!src/**/*.spec.ts',
    '!src/**/test/**',
    '!src/**/presentation/**',
    '!src/**/infra/**',
    '!src/**/application/dto/**',
    '!src/**/config/**',
    '!src/health/**',
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/app.controller.ts',
    '!src/app.service.ts',
    '!**/*.module.ts',
  ],

  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
};

export default config;