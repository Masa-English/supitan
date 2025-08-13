#!/usr/bin/env node

/**
 * 音声ファイルパス更新スクリプト (UPDATE版)
 * UPSERTでエラーが出るため、UPDATEを使用
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

async function main() {
  try {
    console.log('🔧 音声ファイルパス更新を開始...')
    
    // 1. 現在のデータを取得
    const { data: words, error: fetchError } = await supabase
      .from('words')
      .select('id, word, audio_file')
      .order('word')
    
    if (fetchError) {
      throw new Error(`単語データ取得エラー: ${fetchError.message}`)
    }
    
    console.log(`📊 総単語数: ${words.length}`)
    
    // 2. 修正が必要な単語を特定
    const wordsNeedingFix = words.filter(w => 
      w.audio_file && 
      !w.audio_file.endsWith('/word.mp3') &&
      !w.audio_file.includes('/')  // パスセパレータがない場合
    )
    
    console.log(`🔧 修正が必要な単語数: ${wordsNeedingFix.length}`)
    
    if (wordsNeedingFix.length === 0) {
      console.log('✅ すべての音声ファイルパスは正しく設定されています！')
      return
    }
    
    // 修正内容をプレビュー
    console.log('\n📝 修正内容のプレビュー（最初の5個）:')
    wordsNeedingFix.slice(0, 5).forEach((word, index) => {
      console.log(`  ${index + 1}. "${word.word}"`)
      console.log(`     旧: "${word.audio_file}"`)
      console.log(`     新: "${word.audio_file}/word.mp3"`)
    })
    
    // 実行確認
    const shouldFix = process.argv.includes('--yes') || process.argv.includes('--auto')
    
    if (!shouldFix) {
      console.log('\n💡 修正を実行する場合は --yes フラグを使用してください')
      console.log('例: node scripts/update-audio-paths.mjs --yes')
      return
    }
    
    // 3. 一個ずつUPDATEで修正処理実行
    console.log('\n🔧 音声ファイルパス修正を実行中...')
    
    let successCount = 0
    let errorCount = 0
    
    for (const word of wordsNeedingFix) {
      try {
        const newAudioFile = `${word.audio_file}/word.mp3`
        
        const { error } = await supabase
          .from('words')
          .update({ audio_file: newAudioFile })
          .eq('id', word.id)
        
        if (error) {
          console.error(`❌ "${word.word}" 更新エラー:`, error.message)
          errorCount++
        } else {
          successCount++
          if (successCount <= 5 || successCount % 5 === 0) {
            console.log(`✅ "${word.word}" → "${newAudioFile}"`)
          }
        }
        
        // APIレート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.error(`❌ "${word.word}" 実行エラー:`, error)
        errorCount++
      }
    }
    
    // 4. 結果報告
    console.log('\n📊 修正結果:')
    console.log(`✅ 成功: ${successCount} 個`)
    console.log(`❌ 失敗: ${errorCount} 個`)
    
    if (successCount > 0) {
      console.log('\n🎉 音声ファイルパスの修正が完了しました！')
      
      // 5. 修正後の検証
      console.log('\n🔍 修正後の検証を実行中...')
      
      const { data: updatedWords, error: verifyError } = await supabase
        .from('words')
        .select('word, audio_file')
        .limit(3)
        .order('word')
      
      if (verifyError) {
        console.error('❌ 検証エラー:', verifyError.message)
      } else {
        console.log('✅ 修正後のサンプル:')
        updatedWords.forEach((word, index) => {
          console.log(`  ${index + 1}. "${word.word}" → "${word.audio_file}"`)
        })
      }
    }
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

main()
