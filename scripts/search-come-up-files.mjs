#!/usr/bin/env node

/**
 * Storage内のcome_up関連ファイルを全て検索するスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchComeUpFiles() {
  console.log('🔍 Storage内のcome_up関連ファイルを検索中...\n');

  try {
    // 全ファイル一覧を取得
    const { data: allFiles, error: listError } = await supabase.storage
      .from('audio-files')
      .list('', {
        limit: 10000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('❌ ファイル一覧取得エラー:', listError.message);
      return;
    }

    if (!allFiles || allFiles.length === 0) {
      console.log('❌ ファイルが見つかりませんでした');
      return;
    }

    console.log(`📊 総ファイル数: ${allFiles.length}\n`);

    // come_upを含むファイルを検索
    const comeUpFiles = allFiles.filter(file => 
      file.name.toLowerCase().includes('come_up') ||
      file.name.toLowerCase().includes('comeup') ||
      file.name.toLowerCase().includes('come-up')
    );

    if (comeUpFiles.length === 0) {
      console.log('❌ come_up関連のファイルが見つかりませんでした\n');
      
      // 類似ファイルを検索
      console.log('🔍 類似ファイル名を検索中...');
      const similarFiles = allFiles.filter(file => 
        file.name.toLowerCase().includes('come') && 
        (file.name.toLowerCase().includes('up') || file.name.toLowerCase().includes('1') || file.name.toLowerCase().includes('2'))
      );

      if (similarFiles.length > 0) {
        console.log(`\n⚠️  類似ファイルが見つかりました (${similarFiles.length}件):`);
        similarFiles.forEach(file => {
          const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
          const isDir = !file.name.includes('.');
          console.log(`   ${isDir ? '📁' : '📄'} ${file.name}${!isDir ? ` (${size})` : ''}`);
        });
      }
    } else {
      console.log(`✅ come_up関連ファイルが見つかりました (${comeUpFiles.length}件):\n`);
      
      // フォルダとファイルを分類
      const folders = comeUpFiles.filter(f => !f.name.includes('.'));
      const files = comeUpFiles.filter(f => f.name.includes('.'));

      if (folders.length > 0) {
        console.log('📁 フォルダ:');
        folders.forEach(folder => {
          console.log(`   - ${folder.name}`);
        });
        console.log('');
      }

      if (files.length > 0) {
        console.log('📄 ファイル:');
        files.forEach(file => {
          const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
          console.log(`   - ${file.name} (${size})`);
        });
        console.log('');
      }

      // 各フォルダ内のファイルを確認
      for (const folder of folders) {
        console.log(`📁 フォルダ "${folder.name}" 内のファイル:`);
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('audio-files')
          .list(folder.name);

        if (folderError) {
          console.log(`   ❌ エラー: ${folderError.message}`);
        } else if (folderFiles && folderFiles.length > 0) {
          folderFiles.forEach(file => {
            const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
            const isDir = !file.name.includes('.');
            console.log(`   ${isDir ? '📁' : '📄'} ${file.name}${!isDir ? ` (${size})` : ''}`);
          });
        } else {
          console.log(`   📭 フォルダが空です`);
        }
        console.log('');
      }
    }

    // データベースのcome_up関連単語も確認
    console.log('📚 データベース内のcome_up関連単語:');
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, audio_file, category, section')
      .ilike('word', '%come up%')
      .limit(20);

    if (wordsError) {
      console.log(`   ❌ エラー: ${wordsError.message}`);
    } else if (words && words.length > 0) {
      words.forEach(word => {
        console.log(`   - "${word.word}" (audio_file: ${word.audio_file || '未設定'})`);
      });
    } else {
      console.log('   ❌ 単語が見つかりませんでした');
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchComeUpFiles().catch(console.error);

