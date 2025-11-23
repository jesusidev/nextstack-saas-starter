/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/api/**/*.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.api.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsx',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
            },
          },
        ],
      },
      transformIgnorePatterns: ['node_modules/(?!(uuid|@tanstack|@trpc|superjson|@clerk)/)'],
      moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '!<rootDir>/src/__tests__/api/**',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react-jsx',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
            },
          },
        ],
      },
      moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
      },
    },
  ],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/playwright-report/',
    '<rootDir>/test-results/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(uuid|@tanstack|@trpc|superjson|@clerk)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

module.exports = config;
