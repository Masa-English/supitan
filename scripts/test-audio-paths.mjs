#!/usr/bin/env node

/**
 * 音声ファイルパス動作テストスクリプト
 * 修正後の動作を検証
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

// フラッシュカード内の関数を再現
function buildPathFromAudioFile(audioFilePath, index) {
  const normalized = audioFilePath.replace(/\\/g, '/');
  const base = normalized.replace(/\/[^/]+$/, '').replace(/\/$/, '');
  const number = String(index).padStart(3, '0');
  return `${base}/example${number}.mp3`;
}

function buildPathFromWord(word, index) {
  const number = String(index).padStart(3, '0');
  return `${word}/example${number}.mp3`;
}

async function testAudioFileExists(path) {
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(path)
    
    if (error || !data || data.size === 0) {
      return false
    }
    return { exists: true, size: data.size }
  } catch (error) {
    return false
  }
}

async function main() {
  try {
    console.log('🧪 音声ファイルパス動作テストを開始...')
    
    // サンプル単語を取得
    const { data: words, error } = await supabase
      .from('words')
      .select('word, audio_file')
      .limit(3)
      .order('word')
    
    if (error) {
      throw new Error(`単語データ取得エラー: ${error.message}`)
    }
    
    console.log('📊 テスト対象の単語:')
    words.forEach((word, index) => {
      console.log(`  ${index + 1}. "${word.word}" → ${word.audio_file}`)
    })
    
    for (const word of words) {
      console.log(`\n🔍 "${word.word}" の音声ファイル確認:`)
      
      // 1. 単語音声（word.mp3）の確認
      console.log(`  📝 単語音声: ${word.audio_file}`)
      const wordResult = await testAudioFileExists(word.audio_file)
      if (wordResult) {
        console.log(`  ✅ 存在します (${wordResult.size} bytes)`)
      } else {
        console.log(`  ❌ 存在しません`)
      }
      
      // 2. 例文音声の確認
      for (let i = 1; i <= 3; i++) {
        const examplePath = buildPathFromAudioFile(word.audio_file, i)
        console.log(`  📚 例文${i}: ${examplePath}`)
        const exampleResult = await testAudioFileExists(examplePath)
        if (exampleResult) {
          console.log(`  ✅ 存在します (${exampleResult.size} bytes)`)
        } else {
          console.log(`  ❌ 存在しません`)
        }
      }
    }
    
    console.log('\n🎉 音声ファイルパステストが完了しました！')
    console.log('\n💡 結果の解釈:')
    console.log('✅ = 音声ファイルが存在し、正常に再生されるはずです')
    console.log('❌ = ファイルが存在しないため、Web Speech APIが使用されます')
    
  } catch (error) {
    console.error('💥 テスト実行エラー:', error)
    process.exit(1)
  }
}

main()
