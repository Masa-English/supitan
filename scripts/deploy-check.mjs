#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 デプロイ前チェックを開始します...\n');

let hasErrors = false;

// 1. 依存関係の確認
console.log('📦 依存関係を確認中...');
try {
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('✅ 依存関係の確認が完了しました\n');
} catch (error) {
  console.error('❌ 依存関係の確認に失敗しました:', error.message);
  hasErrors = true;
}

// 2. TypeScriptの型チェック
console.log('🔍 TypeScriptの型チェックを実行中...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ TypeScriptの型チェックが完了しました\n');
} catch (error) {
  console.error('❌ TypeScriptの型チェックに失敗しました:', error.message);
  hasErrors = true;
}

// 3. ESLintの実行
console.log('🔍 ESLintを実行中...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLintのチェックが完了しました\n');
} catch (error) {
  console.error('❌ ESLintのチェックに失敗しました:', error.message);
  hasErrors = true;
}

// 4. テストの実行
console.log('🧪 テストを実行中...');
try {
  execSync('npm run test', { stdio: 'inherit' });
  console.log('✅ テストが完了しました\n');
} catch (error) {
  console.error('❌ テストに失敗しました:', error.message);
  hasErrors = true;
}

// 5. 本番ビルドのテスト
console.log('🏗️ 本番ビルドをテスト中...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 本番ビルドが完了しました\n');
} catch (error) {
  console.error('❌ 本番ビルドに失敗しました:', error.message);
  hasErrors = true;
}

// 6. 環境変数の確認
console.log('🔧 環境変数を確認中...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  ${envVar} が設定されていません`);
  } else {
    console.log(`✅ ${envVar} が設定されています`);
  }
}

// 7. セキュリティチェック
console.log('\n🔒 セキュリティチェックを実行中...');
try {
  execSync('npm audit --audit-level high', { stdio: 'inherit' });
  console.log('✅ セキュリティチェックが完了しました\n');
} catch (error) {
  console.error('❌ セキュリティチェックに失敗しました:', error.message);
  hasErrors = true;
}

// 結果の表示
if (hasErrors) {
  console.error('❌ デプロイ前チェックに失敗しました。上記のエラーを修正してから再実行してください。');
  process.exit(1);
} else {
  console.log('🎉 デプロイ前チェックが完了しました！');
  console.log('\n📝 デプロイ可能な状態です。以下のコマンドでデプロイできます:');
  console.log('   vercel --prod');
  console.log('   または');
  console.log('   npm run deploy');
} 