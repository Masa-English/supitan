#!/usr/bin/env node

/**
 * 音声ファイルパス修正スクリプト
 * 
 * 問題: データベースの audio_file が "break up" という形式で保存されている
 * 解決: これを "break up/word.mp3" の形式に修正する
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
    console.log('🔧 音声ファイルパス修正を開始...')
    
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
    console.log('\n📝 修正内容のプレビュー（最初の10個）:')
    wordsNeedingFix.slice(0, 10).forEach((word, index) => {
      console.log(`  ${index + 1}. "${word.word}"`)
      console.log(`     旧: ${word.audio_file}`)
      console.log(`     新: ${word.audio_file}/word.mp3`)
    })
    
    if (wordsNeedingFix.length > 10) {
      console.log(`  ... 他 ${wordsNeedingFix.length - 10} 個`)
    }
    
    // 実行確認
    const shouldFix = process.argv.includes('--yes') || process.argv.includes('--auto')
    
    if (!shouldFix) {
      console.log('\n💡 修正を実行する場合は --yes フラグを使用してください')
      console.log('例: node scripts/fix-audio-paths.mjs --yes')
      return
    }
    
    // 3. 修正処理実行
    console.log('\n🔧 音声ファイルパス修正を実行中...')
    
    let successCount = 0
    let errorCount = 0
    
    // バッチ処理で効率的に更新
    const batchSize = 10
    for (let i = 0; i < wordsNeedingFix.length; i += batchSize) {
      const batch = wordsNeedingFix.slice(i, i + batchSize)
      
      try {
        const updates = batch.map(word => ({
          id: word.id,
          audio_file: `${word.audio_file}/word.mp3`
        }))
        
        const { error } = await supabase
          .from('words')
          .upsert(updates)
        
        if (error) {
          console.error(`❌ バッチ ${Math.floor(i/batchSize) + 1} 更新エラー:`, error.message)
          errorCount += batch.length
        } else {
          successCount += batch.length
          console.log(`✅ バッチ ${Math.floor(i/batchSize) + 1} 完了: ${batch.length} 個の単語を修正`)
        }
        
        // APIレート制限を避けるため少し待機
        if (i + batchSize < wordsNeedingFix.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
      } catch (error) {
        console.error(`❌ バッチ ${Math.floor(i/batchSize) + 1} 実行エラー:`, error)
        errorCount += batch.length
      }
    }
    
    // 4. 結果報告
    console.log('\n📊 修正結果:')
    console.log(`✅ 成功: ${successCount} 個`)
    console.log(`❌ 失敗: ${errorCount} 個`)
    
    if (successCount > 0) {
      console.log('\n🎉 音声ファイルパスの修正が完了しました！')
      console.log('これで音声ボタンをクリックした時に正しいファイルパスが使用されます。')
      
      // 5. 修正後の検証
      console.log('\n🔍 修正後の検証を実行中...')
      
      const { data: updatedWords, error: verifyError } = await supabase
        .from('words')
        .select('word, audio_file')
        .limit(5)
        .order('word')
      
      if (verifyError) {
        console.error('❌ 検証エラー:', verifyError.message)
      } else {
        console.log('✅ 修正後のサンプル:')
        updatedWords.forEach((word, index) => {
          console.log(`  ${index + 1}. "${word.word}" → ${word.audio_file}`)
        })
      }
    }
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

main()
