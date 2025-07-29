#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 開発環境のセットアップを開始します...\n');

// 依存関係のインストール
console.log('📦 依存関係をインストール中...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依存関係のインストールが完了しました\n');
} catch (error) {
  console.error('❌ 依存関係のインストールに失敗しました:', error.message);
  process.exit(1);
}

// 環境変数ファイルの確認
const envFiles = ['.env.local', '.env.example'];
console.log('🔧 環境変数ファイルを確認中...');

for (const envFile of envFiles) {
  if (!existsSync(envFile)) {
    console.log(`⚠️  ${envFile} が見つかりません`);
  } else {
    console.log(`✅ ${envFile} が存在します`);
  }
}

// TypeScriptの型チェック
console.log('\n🔍 TypeScriptの型チェックを実行中...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ TypeScriptの型チェックが完了しました\n');
} catch (error) {
  console.error('❌ TypeScriptの型チェックに失敗しました:', error.message);
}

// ESLintの実行
console.log('🔍 ESLintを実行中...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLintのチェックが完了しました\n');
} catch (error) {
  console.error('❌ ESLintのチェックに失敗しました:', error.message);
}

// Prettierの実行
console.log('🎨 Prettierを実行中...');
try {
  execSync('npm run format', { stdio: 'inherit' });
  console.log('✅ Prettierのフォーマットが完了しました\n');
} catch (error) {
  console.error('❌ Prettierのフォーマットに失敗しました:', error.message);
}

console.log('🎉 開発環境のセットアップが完了しました！');
console.log('\n📝 次のコマンドで開発サーバーを起動できます:');
console.log('   npm run dev');
console.log('\n📝 その他の便利なコマンド:');
console.log('   npm run build     - 本番ビルド');
console.log('   npm run test      - テスト実行');
console.log('   npm run lint      - リントチェック');
console.log('   npm run format    - コードフォーマット'); 