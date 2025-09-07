import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  // 新しいディレクトリ構造に対応したモジュールマッピング
  moduleNameMapper: {
    // メインパス
    '^@/(.*)$': '<rootDir>/$1',
    // コンポーネント関連
    '^@/components/ui/(.*)$': '<rootDir>/components/ui/$1',
    '^@/components/features/(.*)$': '<rootDir>/components/features/$1',
    '^@/components/layout/(.*)$': '<rootDir>/components/layout/$1',
    '^@/components/shared/(.*)$': '<rootDir>/components/shared/$1',
    '^@/components/providers/(.*)$': '<rootDir>/components/providers/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    // ライブラリ関連
    '^@/lib/api/(.*)$': '<rootDir>/lib/api/$1',
    '^@/lib/stores/(.*)$': '<rootDir>/lib/stores/$1',
    '^@/lib/hooks/(.*)$': '<rootDir>/lib/hooks/$1',
    '^@/lib/utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@/lib/constants/(.*)$': '<rootDir>/lib/constants/$1',
    '^@/lib/types/(.*)$': '<rootDir>/lib/types/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    // 設定関連
    '^@/config/(.*)$': '<rootDir>/config/$1',
    // 後方互換性のためのエイリアス
    '^@/types/(.*)$': '<rootDir>/lib/types/$1',
    '^@/utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/lib/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/lib/stores/$1',
    '^@/constants/(.*)$': '<rootDir>/lib/constants/$1',
    '^@/contexts/(.*)$': '<rootDir>/lib/contexts/$1',
    '^@/supabase/(.*)$': '<rootDir>/lib/api/supabase/$1',
    '^@/api/(.*)$': '<rootDir>/lib/api/$1',
    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'config/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // 新しいディレクトリ構造に対応したカバレッジ閾値
    './components/ui/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './components/features/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './lib/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  // 新しいテストファイルパスに対応
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
    '<rootDir>/docs/',
    '<rootDir>/scripts/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // テスト環境の設定
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  // 並列実行の最適化
  maxWorkers: '50%',
  // キャッシュディレクトリの指定
  cacheDirectory: '<rootDir>/.jest-cache',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)