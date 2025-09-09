#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔄 リモートデータベーススキーマの同期を開始します...\n');

try {
  // リモートデータベースからスキーマを取得
  console.log('1. リモートデータベースに接続中...');
  
  // プロジェクトをリンク（既にリンクされている場合はスキップ）
  try {
    execSync('supabase link --project-ref yuzoaegfjjxoptytqtzq', { stdio: 'pipe' });
    console.log('✅ プロジェクトがリンクされました');
  } catch (error) {
    console.log('ℹ️  プロジェクトは既にリンクされています');
  }

  // リモートスキーマを取得
  console.log('2. リモートスキーマを取得中...');
  execSync('supabase db pull', { stdio: 'inherit' });
  
  console.log('\n✅ スキーマの同期が完了しました！');
  console.log('\n次のステップ:');
  console.log('1. supabase/migrations/ フォルダに新しいマイグレーションファイルが作成されました');
  console.log('2. npm run db:start でローカルSupabaseを起動してください');
  console.log('3. マイグレーションが自動的に適用されます');

} catch (error) {
  console.error('❌ スキーマの同期に失敗しました:', error.message);
  console.log('\n手動で以下を実行してください:');
  console.log('1. supabase link --project-ref yuzoaegfjjxoptytqtzq');
  console.log('2. supabase db pull');
  process.exit(1);
}