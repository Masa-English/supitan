#!/usr/bin/env node

/**
 * Supabase Storage内の音声ファイル存在確認スクリプト
 * 
 * このスクリプトは以下の確認を行います：
 * 1. audio-files バケット内の音声ファイル一覧を取得
 * 2. データベースの単語データと照合
 * 3. 存在しない音声ファイルをレポート
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  console.error('必要な環境変数: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listStorageFiles(path = '', limit = 1000) {
  const allFiles = []
  let offset = 0
  
  while (true) {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list(path, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (error) {
      throw new Error(`ストレージファイル一覧取得エラー: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      break
    }
    
    allFiles.push(...data)
    offset += limit
    
    if (data.length < limit) {
      break
    }
  }
  
  return allFiles
}

async function main() {
  try {
    console.log('🔍 Supabase Storage内の音声ファイル確認を開始...')
    
    // 1. ストレージ内のファイル一覧を取得
    console.log('📁 audio-files バケットのファイル一覧を取得中...')
    
    const storageFiles = await listStorageFiles()
    console.log(`📊 ストレージ内ファイル数: ${storageFiles.length}`)
    
    // ファイル構造の分析
    const audioFiles = storageFiles.filter(f => f.name.endsWith('.mp3'))
    const wordFiles = audioFiles.filter(f => f.name === 'word.mp3')
    const exampleFiles = audioFiles.filter(f => f.name.startsWith('example') && f.name.endsWith('.mp3'))
    
    console.log(`🎵 音声ファイル(.mp3): ${audioFiles.length}`)
    console.log(`📝 単語音声(word.mp3): ${wordFiles.length}`)
    console.log(`📚 例文音声(example*.mp3): ${exampleFiles.length}`)
    
    // フォルダ構造の確認
    const folders = storageFiles.filter(f => !f.name.includes('.')).map(f => f.name)
    console.log(`📁 フォルダ数: ${folders.length}`)
    
    if (folders.length > 0) {
      console.log('📁 フォルダの例（最初の10個）:')
      folders.slice(0, 10).forEach((folder, index) => {
        console.log(`  ${index + 1}. ${folder}`)
      })
    }
    
    // 2. データベースの単語データを取得
    console.log('\n🔍 データベースの単語データを取得中...')
    
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, audio_file')
      .order('word')
    
    if (wordsError) {
      throw new Error(`単語データ取得エラー: ${wordsError.message}`)
    }
    
    console.log(`📊 データベース内単語数: ${words.length}`)
    
    // 3. 照合処理
    console.log('\n🔄 音声ファイル存在確認中...')
    
    const wordsWithAudioFile = words.filter(w => w.audio_file)
    const wordsWithoutAudioFile = words.filter(w => !w.audio_file)
    
    console.log(`✅ audio_file設定済み: ${wordsWithAudioFile.length}`)
    console.log(`❌ audio_file未設定: ${wordsWithoutAudioFile.length}`)
    
    // 各単語の音声ファイル存在確認
    let existingCount = 0
    let missingCount = 0
    const missingFiles = []
    
    for (const word of wordsWithAudioFile.slice(0, 50)) { // 最初の50個をチェック
      try {
        const { data, error } = await supabase.storage
          .from('audio-files')
          .list('', { search: word.audio_file })
        
        if (error || !data || data.length === 0) {
          missingCount++
          missingFiles.push({
            word: word.word,
            audioFile: word.audio_file
          })
        } else {
          existingCount++
        }
      } catch (error) {
        console.warn(`⚠️  ${word.word} のファイル確認でエラー: ${error.message}`)
        missingCount++
        missingFiles.push({
          word: word.word,
          audioFile: word.audio_file,
          error: error.message
        })
      }
    }
    
    // 4. レポート出力
    console.log('\n📊 音声ファイル存在確認結果 (最初の50個):')
    console.log(`✅ 存在するファイル: ${existingCount}`)
    console.log(`❌ 存在しないファイル: ${missingCount}`)
    
    if (missingFiles.length > 0) {
      console.log('\n❌ 存在しない音声ファイル（最初の10個）:')
      missingFiles.slice(0, 10).forEach((item, index) => {
        console.log(`  ${index + 1}. "${item.word}" → ${item.audioFile}`)
      })
    }
    
    // 5. 推奨アクション
    console.log('\n💡 推奨アクション:')
    
    if (wordsWithoutAudioFile.length > 0) {
      console.log(`1. ${wordsWithoutAudioFile.length} 個の単語にaudio_fileを設定`)
      console.log('   → scripts/fix-audio-files.mjs --yes を実行')
    }
    
    if (missingCount > 0) {
      console.log(`2. ${missingCount} 個の音声ファイルをStorageにアップロード`)
      console.log('   → 各フォルダにword.mp3ファイルを配置')
    }
    
    console.log('3. 音声ファイルが存在しない場合はWeb Speech APIが自動的に使用されます')
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

// スクリプト実行
main()
