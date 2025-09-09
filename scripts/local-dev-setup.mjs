#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 ローカル開発環境のセットアップを開始します...\n');

// Docker Desktopの確認
console.log('1. Docker Desktopの確認...');
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker Desktopが利用可能です');
} catch (error) {
  console.log('❌ Docker Desktopがインストールされていません');
  console.log('   https://docs.docker.com/desktop からインストールしてください');
  process.exit(1);
}

// Supabase CLIの確認
console.log('\n2. Supabase CLIの確認...');
try {
  const version = execSync('supabase --version', { encoding: 'utf8' });
  console.log(`✅ Supabase CLI: ${version.trim()}`);
} catch (error) {
  console.log('❌ Supabase CLIがインストールされていません');
  console.log('   npm install -g supabase でインストールしてください');
  process.exit(1);
}

// 環境変数ファイルの確認
console.log('\n3. 環境変数ファイルの確認...');
const envLocalDev = '.env.local.development';
if (fs.existsSync(envLocalDev)) {
  console.log(`✅ ${envLocalDev} が存在します`);
} else {
  console.log(`❌ ${envLocalDev} が見つかりません`);
  process.exit(1);
}

console.log('\n🎉 セットアップ完了！');
console.log('\n次のステップ:');
console.log('1. Docker Desktopを起動してください');
console.log('2. npm run db:start でローカルSupabaseを起動してください');
console.log('3. npm run dev:local でアプリケーションを起動してください');