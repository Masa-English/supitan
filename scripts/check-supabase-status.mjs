#!/usr/bin/env node

/**
 * SupabaseのデータベースとStorageの状態を確認するスクリプト
 * 
 * 使用方法:
 *   npm run supabase:status
 *   npm run supabase:status -- --audio-only
 *   npm run supabase:status -- --word=come_up
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
  console.log('   .env.localファイルに以下を設定してください:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=... (または NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
const audioOnly = args.includes('--audio-only');
const wordFilter = args.find(arg => arg.startsWith('--word='))?.split('=')[1];

async function checkDatabaseConnection() {
  console.log('🔌 データベース接続確認中...');
  try {
    const { data, error } = await supabase.from('words').select('id').limit(1);
    if (error) throw error;
    console.log('✅ データベース接続成功\n');
    return true;
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message);
    return false;
  }
}

async function checkStorageConnection() {
  console.log('📦 Storage接続確認中...');
  try {
    const { data, error } = await supabase.storage.from('audio-files').list('', { limit: 1 });
    if (error) throw error;
    console.log('✅ Storage接続成功\n');
    return true;
  } catch (error) {
    console.error('❌ Storage接続エラー:', error.message);
    return false;
  }
}

async function getDatabaseStats() {
  console.log('📊 データベース統計情報\n');

  try {
    // 単語数
    const { count: wordCount, error: wordError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });

    if (wordError) throw wordError;

    // 音声ファイル設定済み単語数
    const { count: wordsWithAudio, error: audioError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .not('audio_file', 'is', null);

    if (audioError) throw audioError;

    // カテゴリー数
    const { count: categoryCount, error: categoryError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (categoryError) throw categoryError;

    console.log(`📚 総単語数: ${wordCount || 0}`);
    console.log(`🎵 音声ファイル設定済み: ${wordsWithAudio || 0}`);
    console.log(`📁 アクティブカテゴリー数: ${categoryCount || 0}\n`);

    return { wordCount, wordsWithAudio, categoryCount };
  } catch (error) {
    console.error('❌ データベース統計取得エラー:', error.message);
    return null;
  }
}

async function getStorageStats() {
  console.log('📦 Storage統計情報\n');

  try {
    // 全ファイル一覧を取得（再帰的に）
    const { data: files, error } = await supabase.storage
      .from('audio-files')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    const audioFiles = files.filter(f => f.name.endsWith('.mp3'));
    const wordFiles = audioFiles.filter(f => f.name === 'word.mp3');
    const exampleFiles = audioFiles.filter(f => f.name.startsWith('example'));
    const folders = files.filter(f => !f.name.includes('.'));

    console.log(`📁 フォルダ数: ${folders.length}`);
    console.log(`🎵 音声ファイル(.mp3): ${audioFiles.length}`);
    console.log(`📝 単語音声(word.mp3): ${wordFiles.length}`);
    console.log(`📚 例文音声(example*.mp3): ${exampleFiles.length}\n`);

    return { files, audioFiles, wordFiles, exampleFiles, folders };
  } catch (error) {
    console.error('❌ Storage統計取得エラー:', error.message);
    return null;
  }
}

async function checkSpecificWord(wordName) {
  console.log(`🔍 単語 "${wordName}" の詳細確認\n`);

  try {
    // データベースから単語を検索
    const { data: words, error: wordError } = await supabase
      .from('words')
      .select('id, word, audio_file, category, section')
      .ilike('word', `%${wordName}%`)
      .limit(10);

    if (wordError) throw wordError;

    if (!words || words.length === 0) {
      console.log(`❌ 単語 "${wordName}" が見つかりませんでした\n`);
      return;
    }

    console.log(`📚 見つかった単語数: ${words.length}\n`);

    for (const word of words) {
      console.log(`📝 単語: ${word.word}`);
      console.log(`   ID: ${word.id}`);
      console.log(`   カテゴリー: ${word.category}`);
      console.log(`   セクション: ${word.section || 'N/A'}`);
      console.log(`   audio_file: ${word.audio_file || '未設定'}`);

      if (word.audio_file) {
        // Storageでファイルの存在確認（複数のパターンを試行）
        let found = false;
        
        // パターン1: そのままのパスで確認
        let resolvedPath = word.audio_file;
        if (!word.audio_file.includes('/') && !word.audio_file.endsWith('.mp3')) {
          resolvedPath = `${word.audio_file}/word.mp3`;
        }

        // パターン1-1: 完全なパスでダウンロードを試行
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('audio-files')
          .download(resolvedPath);

        if (!downloadError && downloadData) {
          console.log(`   ✅ Storageにファイルが存在します: ${resolvedPath} (${(downloadData.size / 1024).toFixed(2)} KB)`);
          found = true;
        } else {
          // パターン1-2: フォルダ内のファイル一覧を確認
          const folderPath = resolvedPath.includes('/') ? resolvedPath.split('/')[0] : resolvedPath.split('/')[0];
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from('audio-files')
            .list(folderPath);

          if (!folderError && folderFiles && folderFiles.length > 0) {
            console.log(`   ✅ Storageにフォルダが存在します: ${folderPath}`);
            console.log(`      フォルダ内のファイル (${folderFiles.length}件):`);
            folderFiles.slice(0, 10).forEach(file => {
              const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
              const isDir = !file.name.includes('.');
              console.log(`         ${isDir ? '📁' : '📄'} ${file.name}${!isDir ? ` (${size})` : ''}`);
            });
            if (folderFiles.length > 10) {
              console.log(`         ... 他 ${folderFiles.length - 10} 件`);
            }
            found = true;
          } else {
            // パターン1-3: 類似ファイル名を検索
            const { data: allFiles, error: listError } = await supabase.storage
              .from('audio-files')
              .list('', {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
              });

            if (!listError && allFiles) {
              const similarFiles = allFiles.filter(file => 
                file.name.toLowerCase().includes(word.audio_file.toLowerCase()) ||
                file.name.toLowerCase().includes(word.audio_file.replace('_', '').toLowerCase())
              );

              if (similarFiles.length > 0) {
                console.log(`   ⚠️  完全一致しませんが、類似ファイルが見つかりました (${similarFiles.length}件):`);
                similarFiles.slice(0, 5).forEach(file => {
                  const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) + ' KB' : 'サイズ不明';
                  console.log(`      - ${file.name} (${size})`);
                });
                found = true;
              }
            }
          }
        }

        if (!found) {
          console.log(`   ❌ Storageにファイルが見つかりません: ${word.audio_file}`);
          console.log(`      試行したパス: ${resolvedPath}`);
        }
      }

      console.log('');
    }
  } catch (error) {
    console.error('❌ 単語確認エラー:', error.message);
  }
}

async function checkAudioFileConsistency() {
  console.log('🔄 データベースとStorageの整合性確認\n');

  try {
    // 音声ファイル設定済みの単語を取得
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, audio_file')
      .not('audio_file', 'is', null)
      .limit(100);

    if (wordsError) throw wordsError;

    console.log(`📊 チェック対象: ${words.length}件\n`);

    let foundCount = 0;
    let missingCount = 0;
    const missingFiles = [];

    for (const word of words) {
      // フォルダ名を抽出
      let folderPath = word.audio_file;
      if (word.audio_file.includes('/')) {
        folderPath = word.audio_file.split('/')[0];
      }

      // Storageでフォルダの存在確認
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('audio-files')
        .list(folderPath);

      if (folderError || !folderFiles || folderFiles.length === 0) {
        missingCount++;
        missingFiles.push({
          word: word.word,
          audio_file: word.audio_file,
          error: folderError?.message || 'フォルダが見つかりません'
        });
      } else {
        foundCount++;
      }
    }

    console.log(`✅ ファイル存在: ${foundCount}件`);
    console.log(`❌ ファイル不在: ${missingCount}件\n`);

    if (missingFiles.length > 0 && missingFiles.length <= 10) {
      console.log('⚠️  不在ファイル一覧:');
      missingFiles.forEach(({ word, audio_file, error }) => {
        console.log(`   - ${word}: ${audio_file} (${error})`);
      });
    } else if (missingFiles.length > 10) {
      console.log(`⚠️  不在ファイルが${missingFiles.length}件あります（最初の10件のみ表示）`);
      missingFiles.slice(0, 10).forEach(({ word, audio_file, error }) => {
        console.log(`   - ${word}: ${audio_file} (${error})`);
      });
    }
  } catch (error) {
    console.error('❌ 整合性確認エラー:', error.message);
  }
}

async function main() {
  console.log('🔍 Supabase状態確認ツール\n');
  console.log('='.repeat(50) + '\n');

  // 接続確認
  const dbConnected = await checkDatabaseConnection();
  const storageConnected = await checkStorageConnection();

  if (!dbConnected || !storageConnected) {
    console.error('❌ 接続に失敗しました');
    process.exit(1);
  }

  // 単語フィルターがある場合は詳細確認
  if (wordFilter) {
    await checkSpecificWord(wordFilter);
    return;
  }

  // データベース統計
  if (!audioOnly) {
    await getDatabaseStats();
  }

  // Storage統計
  await getStorageStats();

  // 整合性確認
  if (!audioOnly) {
    await checkAudioFileConsistency();
  }

  console.log('='.repeat(50));
  console.log('✅ 確認完了');
}

main().catch(console.error);

