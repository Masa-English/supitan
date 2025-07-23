#!/usr/bin/env node

/**
 * Supabase Migration Management Script
 * 
 * Usage:
 *   node scripts/migrate.js status    # Show migration status
 *   node scripts/migrate.js apply     # Apply migrations to remote
 *   node scripts/migrate.js pull      # Pull remote schema to local
 *   node scripts/migrate.js generate  # Generate new migration file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');
const MIGRATIONS_DIR = path.join(SUPABASE_DIR, 'migrations');
const SUPABASE_CLI = path.join(__dirname, '..', 'node_modules', '.bin', 'supabase');

function execCommand(command, options = {}) {
  try {
    // ローカルにインストールされたSupabase CLIを使用
    const fullCommand = command.replace('supabase', SUPABASE_CLI);
    console.log(`🔄 実行中: ${fullCommand}`);
    const result = execSync(fullCommand, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..'),
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ コマンド実行エラー: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function checkSupabaseCLI() {
  try {
    execSync(`${SUPABASE_CLI} --version`, { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Supabase CLIが見つかりません');
    console.log('📦 インストール方法: npm install supabase --save-dev');
    process.exit(1);
  }
}

function showStatus() {
  console.log('📊 Supabaseプロジェクトの状態:');
  
  try {
    console.log('\n📁 ローカルマイグレーションファイル:');
    const migrations = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
    migrations.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    console.log('\n☁️ リモートプロジェクト状態:');
    execCommand('supabase projects list');
  } catch (error) {
    console.log('❌ プロジェクト情報を取得できません');
  }
}

function applyMigrations() {
  console.log('🔄 リモート環境にマイグレーションを適用中...');
  
  try {
    execCommand('supabase db push');
    console.log('✅ マイグレーションが適用されました');
  } catch (error) {
    console.error('❌ マイグレーションの適用に失敗しました');
    console.log('💡 プロジェクトがリンクされているか確認してください');
  }
}

function pullFromRemote() {
  console.log('⬇️ リモートDBスキーマをローカルに同期中...');
  
  try {
    execCommand('supabase db pull');
    console.log('✅ リモートスキーマがローカルに同期されました');
  } catch (error) {
    console.error('❌ リモートからの同期に失敗しました');
  }
}

function generateMigration() {
  console.log('📝 新しいマイグレーションファイルを生成中...');
  
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
  const migrationName = process.argv[3] || 'new_migration';
  const filename = `${timestamp}_${migrationName}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  const template = `-- Migration: ${migrationName}
-- Created at: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- CREATE TABLE example (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     name TEXT NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
`;

  fs.writeFileSync(filepath, template);
  console.log(`✅ マイグレーションファイルを作成しました: ${filename}`);
}

function showHelp() {
  console.log(`
🔧 Supabase Migration Management

使用方法:
  node scripts/migrate.js <command> [options]

コマンド:
  status      プロジェクトの状態とマイグレーションファイルを表示
  apply       マイグレーションをリモート環境に適用
  pull        リモートDBスキーマをローカルに同期
  generate    新しいマイグレーションファイルを生成
              例: node scripts/migrate.js generate add_new_table
  help        このヘルプを表示

推奨ワークフロー:
  1. node scripts/migrate.js status     # 現在の状態を確認
  2. node scripts/migrate.js pull       # リモートスキーマを同期
  3. node scripts/migrate.js generate   # 新しいマイグレーションを作成
  4. node scripts/migrate.js apply      # リモートに適用
`);
}

function main() {
  const command = process.argv[2];
  
  if (!command) {
    showHelp();
    return;
  }
  
  checkSupabaseCLI();
  
  switch (command) {
    case 'status':
      showStatus();
      break;
    case 'apply':
      applyMigrations();
      break;
    case 'pull':
      pullFromRemote();
      break;
    case 'generate':
      generateMigration();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`❌ 不明なコマンド: ${command}`);
      showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
} 