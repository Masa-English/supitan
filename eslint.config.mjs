import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
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
      // 一貫したreturn文の使用（関数型コンポーネントでは緩和）
      'consistent-return': 'warn',
      // 不要なelse文を避ける
      'no-else-return': 'error',
    },
  },
];

export default eslintConfig;
