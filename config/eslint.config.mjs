import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: join(__dirname, '..')
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-console': 'off',
      'consistent-return': 'off',
      'no-else-return': 'error',
      'sort-imports': 'off',
      'no-unused-vars': 'off',
      'react/display-name': 'warn',
      '@typescript-eslint/consistent-type-imports': 'off'
    }
  }
];

export default eslintConfig;