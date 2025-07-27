#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 色付きログ出力
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'cyan');
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'magenta');
}

// コマンド実行関数
function runCommand(command, description, options = {}) {
  try {
    logStep(description);
    const result = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      ...options 
    });
    logSuccess(`${description} - 完了`);
    return { success: true, output: result };
  } catch (error) {
    logError(`${description} - 失敗`);
    console.error(error.stdout || error.message);
    return { success: false, error: error.message };
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

// ファイル内容チェック
function checkFileContent(filePath, checks, description) {
  logStep(description);
  if (!fs.existsSync(filePath)) {
    logError(`${description} - ファイルが存在しません`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let allPassed = true;

  checks.forEach(check => {
    if (check.test(content)) {
      logSuccess(`  ✓ ${check.name}`);
    } else {
      logError(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

// メイン品質チェック関数
async function runQualityCheck() {
  const startTime = Date.now();
  const results = {
    lint: false,
    typeCheck: false,
    build: false,
    manifest: false,
    dependencies: false,
    security: false,
    database: false,
    total: 0,
    passed: 0,
  };

  logSection('Masa Flash 品質チェック開始');
  logInfo(`開始時刻: ${new Date().toLocaleString('ja-JP')}`);

  // 1. 依存関係チェック
  logSection('依存関係チェック');
  const npmAudit = runCommand('npm audit --audit-level=moderate', 'npm audit 実行');
  results.dependencies = npmAudit.success;
  results.total++;
  if (npmAudit.success) results.passed++;

  const npmOutdated = runCommand('npm outdated', '依存関係の更新確認');
  if (npmOutdated.success && npmOutdated.output.trim()) {
    logWarning('更新可能な依存関係があります');
  } else if (!npmOutdated.success) {
    logInfo('依存関係は最新です');
  }

  // 2. リンター実行
  logSection('コード品質チェック');
  const lintResult = runCommand('npm run lint', 'ESLint 実行');
  results.lint = lintResult.success;
  results.total++;
  if (lintResult.success) results.passed++;

  // 3. 型チェック
  logSection('型チェック');
  const typeCheckResult = runCommand('npm run type-check', 'TypeScript 型チェック');
  results.typeCheck = typeCheckResult.success;
  results.total++;
  if (typeCheckResult.success) results.passed++;

  // 4. ビルドテスト
  logSection('ビルドテスト');
  const buildResult = runCommand('npm run build', 'Next.js ビルド');
  results.build = buildResult.success;
  results.total++;
  if (buildResult.success) results.passed++;

  // 5. マニフェストファイルチェック
  logSection('マニフェスト・設定ファイルチェック');
  
  const manifestChecks = [
    {
      name: 'package.json の必須フィールド',
      test: (content) => {
        const pkg = JSON.parse(content);
        return pkg.name && pkg.version && pkg.scripts && pkg.dependencies;
      }
    },
    {
      name: 'package.json のスクリプト',
      test: (content) => {
        const pkg = JSON.parse(content);
        const requiredScripts = ['dev', 'build', 'start', 'lint'];
        return requiredScripts.every(script => pkg.scripts[script]);
      }
    }
  ];

  results.manifest = checkFileContent('package.json', manifestChecks, 'package.json チェック');
  results.total++;
  if (results.manifest) results.passed++;

  // 6. 設定ファイルチェック
  const configFiles = [
    { path: 'next.config.ts', name: 'Next.js 設定' },
    { path: 'tailwind.config.ts', name: 'Tailwind CSS 設定' },
    { path: 'tsconfig.json', name: 'TypeScript 設定' },
    { path: 'eslint.config.mjs', name: 'ESLint 設定' },
    { path: 'supabase/config.toml', name: 'Supabase 設定' },
  ];

  configFiles.forEach(file => {
    checkFileExists(file.path, file.name);
  });

  // 7. 環境変数チェック
  logSection('環境変数チェック');
  const envFiles = ['.env.local', '.env.example'];
  envFiles.forEach(file => {
    checkFileExists(file, `環境変数ファイル: ${file}`);
  });

  // 8. データベースチェック
  logSection('データベースチェック');
  
  // Supabase設定ファイルの存在確認
  const supabaseConfigExists = checkFileExists('supabase/config.toml', 'Supabase設定ファイル');
  const migrationsDirExists = checkFileExists('supabase/migrations', 'マイグレーションディレクトリ');
  
  results.database = supabaseConfigExists && migrationsDirExists;
  results.total++;
  if (results.database) results.passed++;
  
  if (!results.database) {
    logWarning('Supabase設定ファイルまたはマイグレーションディレクトリが存在しません。');
  }

  // 9. セキュリティチェック
  logSection('セキュリティチェック');
  
  const securityChecks = [
    {
      name: '機密情報の露出チェック',
      test: (content) => {
        const sensitivePatterns = [
          /SUPABASE_ANON_KEY\s*=\s*['"][^'"]+['"]/,
          /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/,
          /DATABASE_URL\s*=\s*['"][^'"]+['"]/,
        ];
        return !sensitivePatterns.some(pattern => pattern.test(content));
      }
    }
  ];

  const envCheck = checkFileContent('.env.example', securityChecks, '環境変数テンプレート');
  results.security = envCheck;
  results.total++;
  if (envCheck) results.passed++;

  // 10. ファイル構造チェック
  logSection('ファイル構造チェック');
  const requiredDirs = [
    'app', 'components', 'lib', 'public', 'supabase'
  ];
  
  requiredDirs.forEach(dir => {
    checkFileExists(dir, `ディレクトリ: ${dir}`);
  });

  // 11. 最終結果
  logSection('品質チェック結果');
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  logInfo(`実行時間: ${duration}秒`);
  logInfo(`総チェック項目: ${results.total}`);
  logInfo(`成功: ${results.passed}/${results.total}`);

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  
  if (results.passed === results.total) {
    logSuccess(`🎉 すべてのチェックが成功しました！ (${successRate}%)`);
  } else {
    logWarning(`⚠️  ${results.total - results.passed}個のチェックが失敗しました (${successRate}%)`);
  }

  // 詳細結果
  console.log('\n📊 詳細結果:');
  Object.entries(results).forEach(([key, value]) => {
    if (key !== 'total' && key !== 'passed') {
      const status = value ? '✅' : '❌';
      log(`${status} ${key}: ${value ? '成功' : '失敗'}`);
    }
  });

  // 終了コード
  process.exit(results.passed === results.total ? 0 : 1);
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
runQualityCheck(); 