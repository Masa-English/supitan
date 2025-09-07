#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 デプロイ前チェックを開始します...\n');

// チェック項目
const checks = [
  {
    name: '環境変数ファイル',
    check: () => {
      const envFiles = ['.env.local', '.env.production'];
      const missing = envFiles.filter(file => !existsSync(file));
      if (missing.length > 0) {
        console.log(`⚠️  警告: 以下の環境変数ファイルが見つかりません: ${missing.join(', ')}`);
        console.log('   env.exampleをコピーして設定してください');
        return false;
      }
      return true;
    }
  },
  {
    name: 'TypeScript型チェック',
    check: () => {
      try {
        execSync('npm run type-check', { stdio: 'pipe' });
        return true;
      } catch (error) {
        console.log('❌ TypeScript型エラーがあります');
        return false;
      }
    }
  },
  {
    name: 'ESLintチェック',
    check: () => {
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return true;
      } catch (error) {
        console.log('❌ ESLintエラーがあります');
        return false;
      }
    }
  },
  {
    name: 'ビルドテスト',
    check: () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return true;
      } catch (error) {
        console.log('❌ ビルドエラーがあります');
        return false;
      }
    }
  },
  {
    name: 'テスト実行',
    check: () => {
      try {
        execSync('npm run test', { stdio: 'pipe' });
        return true;
      } catch (error) {
        console.log('❌ テストエラーがあります');
        return false;
      }
    }
  }
];

// チェック実行
let allPassed = true;

for (const check of checks) {
  console.log(`🔍 ${check.name}をチェック中...`);
  const passed = check.check();
  if (passed) {
    console.log(`✅ ${check.name}: OK\n`);
  } else {
    console.log(`❌ ${check.name}: 失敗\n`);
    allPassed = false;
  }
}

// 結果表示
if (allPassed) {
  console.log('🎉 すべてのチェックが完了しました！デプロイ可能です。');
  process.exit(0);
} else {
  console.log('⚠️  一部のチェックが失敗しました。デプロイ前に修正してください。');
  process.exit(1);
}
