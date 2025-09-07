#!/usr/bin/env node

/**
 * 詳細音声ファイル確認スクリプト
 * 特定のフォルダ内の音声ファイルを詳しく確認
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFolderContents(folderName) {
  console.log(`\n📁 フォルダ "${folderName}" の内容を確認中...`)
  
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list(folderName, { limit: 100 })
    
    if (error) {
      console.error(`❌ エラー: ${error.message}`)
      return
    }
    
    if (!data || data.length === 0) {
      console.log(`❌ フォルダは空です`)
      return
    }
    
    console.log(`📂 ファイル数: ${data.length}`)
    data.forEach((file, index) => {
      const icon = file.name.endsWith('.mp3') ? '🎵' : '📄'
      console.log(`  ${index + 1}. ${icon} ${file.name}`)
    })
    
  } catch (error) {
    console.error(`💥 フォルダチェックエラー: ${error.message}`)
  }
}

async function main() {
  console.log('🔍 詳細音声ファイル確認を開始...')
  
  // 最初の5つのフォルダの中身をチェック
  const foldersToCheck = ['break up', 'carry on', 'check out', 'come in', 'find out']
  
  for (const folder of foldersToCheck) {
    await checkFolderContents(folder)
  }
  
  // データベースから実際の音声ファイルパス情報を取得
  console.log('\n🔍 データベースの音声ファイル設定を確認...')
  
  const { data: words, error } = await supabase
    .from('words')
    .select('word, audio_file')
    .limit(5)
    .order('word')
  
  if (error) {
    console.error('❌ データベースエラー:', error.message)
    return
  }
  
  console.log('\n📊 データベース内の音声ファイル設定:')
  words.forEach((word, index) => {
    console.log(`  ${index + 1}. "${word.word}" → ${word.audio_file}`)
  })
}

main()
