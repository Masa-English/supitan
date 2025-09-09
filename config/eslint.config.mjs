import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: join(__dirname, '..'), // プロジェクトルートを指定
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // React Hooksの依存関係チェックを強化
      'react-hooks/exhaustive-deps': 'error',
      // 未使用の変数を警告（アンダースコアプレフィックスを許可）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // コンソールログを本番環境では警告（ビルド時は無効化）
      'no-console': 'off',
      // 一貫したreturn文の使用（redirect関数使用時は無効化）
      'consistent-return': 'off',
      // 不要なelse文を避ける
      'no-else-return': 'error',
      // インポート順序の最適化（緩和版）
      'sort-imports': 'off', // 一時的に無効化
      // 未使用のインポートを警告（Next.js 15対応）
      'no-unused-vars': 'off',
      // コンポーネントの命名規則
      'react/display-name': 'warn',
      // TypeScript関連の最適化（緩和版）
      '@typescript-eslint/consistent-type-imports': 'off', // 一時的に無効化
    },
  },

];

export default eslintConfig;
