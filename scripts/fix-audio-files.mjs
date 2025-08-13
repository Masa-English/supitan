#!/usr/bin/env node

/**
 * 音声ファイル設定の修正スクリプト
 * 
 * このスクリプトは以下の問題を解決します：
 * 1. データベースのwordsテーブルでaudio_fileフィールドがnullまたは空の単語を修正
 * 2. 各単語に対して "${word}/word.mp3" の形式でパスを設定
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

async function main() {
  try {
    console.log('🔍 音声ファイル設定の確認を開始...')
    
    // 1. 現在の状況を確認
    const { data: allWords, error: fetchError } = await supabase
      .from('words')
      .select('id, word, audio_file')
      .order('word')
    
    if (fetchError) {
      throw new Error(`単語データ取得エラー: ${fetchError.message}`)
    }
    
    console.log(`📊 総単語数: ${allWords.length}`)
    
    const withAudioFile = allWords.filter(w => w.audio_file && w.audio_file.trim() !== '')
    const withoutAudioFile = allWords.filter(w => !w.audio_file || w.audio_file.trim() === '')
    
    console.log(`✅ 音声ファイル設定済み: ${withAudioFile.length}`)
    console.log(`❌ 音声ファイル未設定: ${withoutAudioFile.length}`)
    
    if (withoutAudioFile.length === 0) {
      console.log('🎉 すべての単語に音声ファイルが設定されています！')
      return
    }
    
    console.log('\n📝 修正対象の単語（最初の10個）:')
    withoutAudioFile.slice(0, 10).forEach((word, index) => {
      console.log(`  ${index + 1}. "${word.word}" → "${word.word}/word.mp3"`)
    })
    
    if (withoutAudioFile.length > 10) {
      console.log(`  ... 他 ${withoutAudioFile.length - 10} 個`)
    }
    
    // 2. 確認プロンプト（実際の更新前）
    console.log(`\n⚠️  ${withoutAudioFile.length} 個の単語のaudio_fileフィールドを更新しますか？`)
    console.log('注意: この操作はデータベースを変更します。')
    
    // 自動実行の場合はコメントアウトを外してください
    // const shouldUpdate = true
    
    // 手動確認の場合
    const shouldUpdate = process.argv.includes('--auto') || process.argv.includes('--yes')
    
    if (!shouldUpdate) {
      console.log('💡 実際に更新を実行する場合は --yes または --auto フラグを使用してください')
      console.log('例: node scripts/fix-audio-files.mjs --yes')
      return
    }
    
    // 3. 更新処理
    console.log('\n🔧 音声ファイルパスの更新を開始...')
    
    let successCount = 0
    let errorCount = 0
    
    // バッチ処理で効率的に更新
    const batchSize = 10
    for (let i = 0; i < withoutAudioFile.length; i += batchSize) {
      const batch = withoutAudioFile.slice(i, i + batchSize)
      
      try {
        const updates = batch.map(word => ({
          id: word.id,
          audio_file: `${word.word}/word.mp3`
        }))
        
        const { error } = await supabase
          .from('words')
          .upsert(updates)
        
        if (error) {
          console.error(`❌ バッチ ${Math.floor(i/batchSize) + 1} 更新エラー:`, error.message)
          errorCount += batch.length
        } else {
          successCount += batch.length
          console.log(`✅ バッチ ${Math.floor(i/batchSize) + 1} 完了: ${batch.length} 個の単語を更新`)
        }
        
        // APIレート制限を避けるため少し待機
        if (i + batchSize < withoutAudioFile.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
      } catch (error) {
        console.error(`❌ バッチ ${Math.floor(i/batchSize) + 1} 実行エラー:`, error)
        errorCount += batch.length
      }
    }
    
    // 4. 結果報告
    console.log('\n📊 更新結果:')
    console.log(`✅ 成功: ${successCount} 個`)
    console.log(`❌ 失敗: ${errorCount} 個`)
    
    if (successCount > 0) {
      console.log('\n🎉 音声ファイルパスの設定が完了しました！')
      console.log('注意: 実際の音声ファイル（.mp3）がSupabase Storageに存在するかは別途確認が必要です。')
    }
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

// スクリプト実行
main()
