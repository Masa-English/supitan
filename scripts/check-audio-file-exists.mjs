#!/usr/bin/env node

/**
 * 特定の音声ファイルパスの存在を詳細に確認するスクリプト
 * 
 * 使用方法:
 *   node scripts/check-audio-file-exists.mjs come_up1
 *   node scripts/check-audio-file-exists.mjs come_up2
 *   node scripts/check-audio-file-exists.mjs come_up1/word.mp3
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const audioFilePath = process.argv[2];

if (!audioFilePath) {
  console.error('❌ 音声ファイルパスを指定してください');
  console.log('使用方法: node scripts/check-audio-file-exists.mjs <audio_file_path>');
  console.log('例: node scripts/check-audio-file-exists.mjs come_up1');
  console.log('例: node scripts/check-audio-file-exists.mjs come_up1/word.mp3');
  process.exit(1);
}

async function checkFileExists(path) {
  console.log(`🔍 パス "${path}" の存在確認中...\n`);

  // パターン1: そのままのパスで確認
  console.log(`📌 パターン1: "${path}" をそのまま確認`);
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list('', {
        search: path
      });

    if (error) {
      console.log(`   ❌ エラー: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   ✅ 見つかりました (${data.length}件)`);
      data.forEach(file => {
        console.log(`      - ${file.name} (${file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明'})`);
      });
      return true;
    } else {
      console.log(`   ❌ 見つかりませんでした`);
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
  }

  // パターン2: フォルダ名のみの場合、word.mp3を追加
  if (!path.includes('/') && !path.endsWith('.mp3')) {
    const pathWithWord = `${path}/word.mp3`;
    console.log(`\n📌 パターン2: "${pathWithWord}" を確認`);
    try {
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(pathWithWord);

      if (error) {
        console.log(`   ❌ エラー: ${error.message}`);
      } else if (data) {
        console.log(`   ✅ 見つかりました (${(data.size / 1024).toFixed(2)} KB)`);
        return true;
      } else {
        console.log(`   ❌ 見つかりませんでした`);
      }
    } catch (error) {
      console.log(`   ❌ エラー: ${error.message}`);
    }
  }

  // パターン3: フォルダ内のファイル一覧を確認
  const folderPath = path.includes('/') ? path.split('/')[0] : path;
  console.log(`\n📌 パターン3: フォルダ "${folderPath}" 内のファイル一覧を確認`);
  try {
    const { data: folderFiles, error: folderError } = await supabase.storage
      .from('audio-files')
      .list(folderPath);

    if (folderError) {
      console.log(`   ❌ フォルダアクセスエラー: ${folderError.message}`);
    } else if (folderFiles && folderFiles.length > 0) {
      console.log(`   ✅ フォルダ内に ${folderFiles.length} 個のファイルが見つかりました:`);
      folderFiles.forEach(file => {
        const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
        const isDir = !file.name.includes('.');
        console.log(`      ${isDir ? '📁' : '📄'} ${file.name}${!isDir ? ` (${size})` : ''}`);
      });
      return true;
    } else {
      console.log(`   ❌ フォルダが空または存在しません`);
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
  }

  // パターン4: 類似ファイル名を検索
  console.log(`\n📌 パターン4: 類似ファイル名を検索`);
  try {
    const { data: allFiles, error: listError } = await supabase.storage
      .from('audio-files')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.log(`   ❌ 一覧取得エラー: ${listError.message}`);
    } else if (allFiles) {
      const similarFiles = allFiles.filter(file => 
        file.name.toLowerCase().includes(path.toLowerCase()) ||
        file.name.toLowerCase().includes(path.replace('_', '').toLowerCase())
      );

      if (similarFiles.length > 0) {
        console.log(`   ✅ 類似ファイル名が見つかりました (${similarFiles.length}件):`);
        similarFiles.slice(0, 20).forEach(file => {
          const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
          const isDir = !file.name.includes('.');
          console.log(`      ${isDir ? '📁' : '📄'} ${file.name}${!isDir ? ` (${size})` : ''}`);
        });
        if (similarFiles.length > 20) {
          console.log(`      ... 他 ${similarFiles.length - 20} 件`);
        }
        return true;
      } else {
        console.log(`   ❌ 類似ファイル名が見つかりませんでした`);
      }
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
  }

  return false;
}

async function main() {
  console.log('🔍 音声ファイル存在確認ツール\n');
  console.log('='.repeat(50) + '\n');

  const exists = await checkFileExists(audioFilePath);

  console.log('\n' + '='.repeat(50));
  if (exists) {
    console.log('✅ ファイルまたはフォルダが見つかりました');
  } else {
    console.log('❌ ファイルが見つかりませんでした');
    console.log('\n💡 確認事項:');
    console.log('   1. ファイル名が正確か確認してください');
    console.log('   2. Storageのバケット名が "audio-files" であることを確認してください');
    console.log('   3. ファイルが実際にアップロードされているか確認してください');
  }
}

main().catch(console.error);

