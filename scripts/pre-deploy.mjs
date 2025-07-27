#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

// 色付きログ出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🚀 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logStep(step) {
  log(`\n📋 ${step}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// コマンド実行関数
function runCommand(command, description) {
  try {
    logStep(description);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} - 完了`);
    return true;
  } catch (error) {
    logError(`${description} - 失敗`);
    return false;
  }
}

// ファイル存在チェック
function checkFileExists(filePath, description) {
  logStep(description);
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} - 存在`);
    return true;
  } else {
    logError(`${description} - 存在しません`);
    return false;
  }
}

// メインデプロイ前チェック関数
async function runPreDeployCheck() {
  const startTime = Date.now();
  let allChecksPassed = true;

  logSection('Masa Flash デプロイ前チェック開始');
  log(`開始時刻: ${new Date().toLocaleString('ja-JP')}`);

  // 1. 依存関係の確認
  logSection('依存関係チェック');
  if (!runCommand('npm audit', '依存関係セキュリティチェック')) {
    logWarning('依存関係にセキュリティの問題があります。確認してください。');
  }

  // 2. リンター実行
  logSection('コード品質チェック');
  if (!runCommand('npm run lint', 'ESLint 実行')) {
    allChecksPassed = false;
  }

  // 3. 型チェック
  logSection('型チェック');
  if (!runCommand('npm run type-check', 'TypeScript 型チェック')) {
    allChecksPassed = false;
  }

  // 4. テスト実行
  logSection('テスト実行');
  if (!runCommand('npm run test', 'ユニットテスト実行')) {
    allChecksPassed = false;
  }

  // 5. ビルドテスト
  logSection('ビルドテスト');
  if (!runCommand('npm run build', 'Next.js ビルド')) {
    allChecksPassed = false;
  }

  // 6. 環境変数チェック
  logSection('環境変数チェック');
  const envFiles = ['.env.local', '.env.production'];
  envFiles.forEach(file => {
    if (!checkFileExists(file, `環境変数ファイル: ${file}`)) {
      logWarning(`${file} が存在しません。本番環境では必要です。`);
    }
  });

  // 7. セキュリティチェック
  logSection('セキュリティチェック');
  if (!runCommand('npm audit --audit-level=high', 'セキュリティ監査')) {
    logWarning('セキュリティの問題が見つかりました。確認してください。');
  }

  // 8. データベース設定確認
  logSection('データベースチェック');
  if (!checkFileExists('supabase/config.toml', 'Supabase設定ファイル')) {
    logWarning('Supabase設定ファイルが存在しません。');
  }
  if (!checkFileExists('supabase/migrations', 'マイグレーションディレクトリ')) {
    logWarning('マイグレーションディレクトリが存在しません。');
  }

  // 9. 最終結果
  logSection('デプロイ前チェック結果');
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`実行時間: ${duration}秒`);

  if (allChecksPassed) {
    logSuccess('🎉 すべてのチェックが成功しました！デプロイを続行できます。');
    log('\n📋 デプロイ手順:');
    log('1. git add . && git commit -m "Deploy: 変更内容の説明"');
    log('2. git push origin main');
    log('3. Vercelでデプロイが自動的に開始されます');
  } else {
    logError('❌ 一部のチェックが失敗しました。デプロイ前に修正してください。');
    process.exit(1);
  }
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  logError('未処理のPromise拒否:');
  console.error(reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError('未捕捉の例外:');
  console.error(error);
  process.exit(1);
});

// スクリプト実行
runPreDeployCheck(); 