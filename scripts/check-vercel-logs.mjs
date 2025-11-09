#!/usr/bin/env node

/**
 * Vercelのログを確認するスクリプト
 * 
 * 使用方法:
 *   npm run vercel:logs
 *   npm run vercel:logs -- --function=api/audio
 *   npm run vercel:logs -- --limit=100
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const args = process.argv.slice(2);
const functionFilter = args.find(arg => arg.startsWith('--function='))?.split('=')[1];
const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '50';

async function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getVercelLogs() {
  console.log('📋 Vercelのログを取得中...\n');

  if (!await checkVercelCLI()) {
    console.error('❌ Vercel CLIがインストールされていません。');
    console.log('   インストール方法: npm install -g vercel');
    console.log('   または、Vercelのダッシュボードからログを確認してください:');
    console.log('   https://vercel.com/dashboard');
    return;
  }

  try {
    const command = [
      'vercel logs',
      '--follow=false',
      `--limit=${limit}`,
      functionFilter ? `--function=${functionFilter}` : ''
    ].filter(Boolean).join(' ');

    console.log(`実行コマンド: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ ログ取得エラー:', error.message);
    console.log('\n💡 代替方法:');
    console.log('   1. Vercelダッシュボードから確認: https://vercel.com/dashboard');
    console.log('   2. プロジェクトの「Deployments」→ デプロイメントを選択 → 「Functions」タブ');
    console.log('   3. または、Vercel CLIでログイン: vercel login');
  }
}

async function main() {
  console.log('🔍 Vercelログ確認ツール\n');
  
  if (functionFilter) {
    console.log(`📌 フィルター: ${functionFilter}`);
  }
  console.log(`📊 取得件数: ${limit}件\n`);

  await getVercelLogs();
}

main().catch(console.error);

