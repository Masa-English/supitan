#!/usr/bin/env node

/**
 * Quiz音声ファイル再生チェックスクリプト
 * 
 * このスクリプトは以下の確認を行います：
 * 1. Quizで使用される音声ファイルの存在確認
 * 2. 効果音（正解音・不正解音）の確認
 * 3. 単語音声ファイルの再生可能性確認
 * 4. 実際のブラウザ環境での音声再生テスト
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

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

// チェック結果を格納するオブジェクト
const checkResults = {
  soundEffects: {
    correct: { exists: false, playable: false, error: null },
    incorrect: { exists: false, playable: false, error: null }
  },
  wordAudio: {
    total: 0,
    exists: 0,
    playable: 0,
    missing: 0,
    errors: []
  },
  summary: {
    passed: false,
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0
  }
}

/**
 * 効果音ファイルの存在確認
 */
async function checkSoundEffects() {
  console.log('🔊 効果音ファイルの確認中...')
  
  const soundEffects = [
    { name: 'correct', path: 'se/collect.mp3' },
    { name: 'incorrect', path: 'se/error.mp3' }
  ]
  
  for (const effect of soundEffects) {
    try {
      console.log(`  📁 ${effect.name}音 (${effect.path}) をチェック中...`)
      
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(effect.path)
      
      if (error) {
        console.log(`    ❌ ファイルが見つかりません: ${error.message}`)
        checkResults.soundEffects[effect.name] = {
          exists: false,
          playable: false,
          error: error.message
        }
      } else if (data && data.size > 0) {
        console.log(`    ✅ ファイル存在確認 (${data.size} bytes)`)
        checkResults.soundEffects[effect.name] = {
          exists: true,
          playable: true,
          error: null
        }
        checkResults.summary.passedChecks++
      } else {
        console.log(`    ⚠️  ファイルは存在するがサイズが0`)
        checkResults.soundEffects[effect.name] = {
          exists: true,
          playable: false,
          error: 'ファイルサイズが0'
        }
      }
      
      checkResults.summary.totalChecks++
    } catch (error) {
      console.log(`    💥 エラー: ${error.message}`)
      checkResults.soundEffects[effect.name] = {
        exists: false,
        playable: false,
        error: error.message
      }
      checkResults.summary.totalChecks++
    }
  }
}

/**
 * 単語音声ファイルの確認
 */
async function checkWordAudio() {
  console.log('\n📚 単語音声ファイルの確認中...')
  
  // データベースから単語データを取得
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, word, audio_file, category')
    .not('audio_file', 'is', null)
    .limit(20) // 最初の20個をチェック
  
  if (wordsError) {
    console.error(`❌ 単語データ取得エラー: ${wordsError.message}`)
    return
  }
  
  console.log(`📊 チェック対象単語数: ${words.length}`)
  checkResults.wordAudio.total = words.length
  
  for (const word of words) {
    try {
      console.log(`  🔍 "${word.word}" (${word.audio_file}) をチェック中...`)
      
      // 音声ファイルの存在確認
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(word.audio_file)
      
      if (error) {
        console.log(`    ❌ ファイルが見つかりません: ${error.message}`)
        checkResults.wordAudio.missing++
        checkResults.wordAudio.errors.push({
          word: word.word,
          audioFile: word.audio_file,
          error: error.message
        })
      } else if (data && data.size > 0) {
        console.log(`    ✅ ファイル存在確認 (${data.size} bytes)`)
        checkResults.wordAudio.exists++
        
        // ファイルサイズが妥当かチェック（最小100バイト）
        if (data.size > 100) {
          checkResults.wordAudio.playable++
          checkResults.summary.passedChecks++
        } else {
          console.log(`    ⚠️  ファイルサイズが小さすぎます (${data.size} bytes)`)
          checkResults.wordAudio.errors.push({
            word: word.word,
            audioFile: word.audio_file,
            error: `ファイルサイズが小さすぎます (${data.size} bytes)`
          })
        }
      } else {
        console.log(`    ⚠️  ファイルは存在するがサイズが0`)
        checkResults.wordAudio.errors.push({
          word: word.word,
          audioFile: word.audio_file,
          error: 'ファイルサイズが0'
        })
      }
      
      checkResults.summary.totalChecks++
    } catch (error) {
      console.log(`    💥 エラー: ${error.message}`)
      checkResults.wordAudio.errors.push({
        word: word.word,
        audioFile: word.audio_file,
        error: error.message
      })
      checkResults.summary.totalChecks++
    }
  }
}

/**
 * ブラウザ環境での音声再生テスト
 */
async function testBrowserAudioPlayback() {
  console.log('\n🌐 ブラウザ環境での音声再生テスト...')
  
  // テスト用のHTMLファイルを作成
  const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Quiz音声再生テスト</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .success { color: green; }
        .error { color: red; }
        button { margin: 5px; padding: 10px; }
    </style>
</head>
<body>
    <h1>Quiz音声再生テスト</h1>
    
    <div class="test-section">
        <h3>効果音テスト</h3>
        <button onclick="testSoundEffect('se/collect.mp3', 'correct')">正解音テスト</button>
        <button onclick="testSoundEffect('se/error.mp3', 'incorrect')">不正解音テスト</button>
        <div id="soundEffectResult"></div>
    </div>
    
    <div class="test-section">
        <h3>単語音声テスト</h3>
        <button onclick="testWordAudio()">単語音声テスト</button>
        <div id="wordAudioResult"></div>
    </div>
    
    <div class="test-section">
        <h3>Web Speech APIテスト</h3>
        <button onclick="testWebSpeechAPI()">Web Speech APIテスト</button>
        <div id="webSpeechResult"></div>
    </div>
    
    <script>
        const SUPABASE_URL = '${supabaseUrl}';
        
        async function testSoundEffect(path, type) {
            const resultDiv = document.getElementById('soundEffectResult');
            resultDiv.innerHTML = '<p>テスト中...</p>';
            
            try {
                const response = await fetch(\`\${SUPABASE_URL}/storage/v1/object/public/audio-files/\${path}\`);
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                
                audio.onloadstart = () => {
                    resultDiv.innerHTML = '<p class="success">✅ 音声ファイル読み込み開始</p>';
                };
                
                audio.oncanplaythrough = () => {
                    resultDiv.innerHTML = '<p class="success">✅ 音声ファイル再生準備完了</p>';
                };
                
                audio.onerror = (e) => {
                    resultDiv.innerHTML = '<p class="error">❌ 音声再生エラー: ' + e.message + '</p>';
                };
                
                await audio.play();
                resultDiv.innerHTML = '<p class="success">✅ 音声再生成功</p>';
                
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);
                
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">❌ エラー: ' + error.message + '</p>';
            }
        }
        
        async function testWordAudio() {
            const resultDiv = document.getElementById('wordAudioResult');
            resultDiv.innerHTML = '<p>単語音声テスト中...</p>';
            
    // サンプル単語の音声ファイルをテスト
    const testWords = ['accept/example00001.mp3', 'agree/example00002.mp3', 'answer/example00003.mp3'];
            let successCount = 0;
            
            for (const wordPath of testWords) {
                try {
                    const response = await fetch(\`\${SUPABASE_URL}/storage/v1/object/public/audio-files/\${wordPath}\`);
                    if (response.ok) {
                        successCount++;
                    }
                } catch (error) {
                    console.error('単語音声テストエラー:', error);
                }
            }
            
            resultDiv.innerHTML = \`<p class="success">✅ 単語音声テスト完了: \${successCount}/\${testWords.length} 成功</p>\`;
        }
        
        function testWebSpeechAPI() {
            const resultDiv = document.getElementById('webSpeechResult');
            
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Hello, this is a test');
                utterance.lang = 'en-US';
                utterance.rate = 0.8;
                
                utterance.onstart = () => {
                    resultDiv.innerHTML = '<p class="success">✅ Web Speech API 再生開始</p>';
                };
                
                utterance.onend = () => {
                    resultDiv.innerHTML = '<p class="success">✅ Web Speech API 再生完了</p>';
                };
                
                utterance.onerror = (e) => {
                    resultDiv.innerHTML = '<p class="error">❌ Web Speech API エラー: ' + e.error + '</p>';
                };
                
                speechSynthesis.speak(utterance);
            } else {
                resultDiv.innerHTML = '<p class="error">❌ Web Speech API がサポートされていません</p>';
            }
        }
    </script>
</body>
</html>
  `
  
  // 一時ファイルに保存
  const tempFile = path.join(process.cwd(), 'temp-audio-test.html')
  fs.writeFileSync(tempFile, testHtml)
  
  console.log('  📄 テスト用HTMLファイルを作成しました')
  console.log(`  📁 ファイルパス: ${tempFile}`)
  console.log('  🌐 ブラウザでこのファイルを開いて音声再生テストを実行してください')
  console.log('  💡 または以下のコマンドで自動的にブラウザを開きます:')
  console.log(`     start ${tempFile}`)
  
  // Windows環境でブラウザを自動起動
  if (process.platform === 'win32') {
    try {
      spawn('start', [tempFile], { shell: true, detached: true })
      console.log('  🚀 ブラウザを自動起動しました')
    } catch (error) {
      console.log('  ⚠️  ブラウザの自動起動に失敗しました')
    }
  }
}

/**
 * 結果レポートの生成
 */
function generateReport() {
  console.log('\n📊 チェック結果レポート')
  console.log('=' .repeat(50))
  
  // 効果音の結果
  console.log('\n🔊 効果音ファイル:')
  console.log(`  正解音: ${checkResults.soundEffects.correct.exists ? '✅' : '❌'} ${checkResults.soundEffects.correct.exists ? '存在' : '不存在'}`)
  console.log(`  不正解音: ${checkResults.soundEffects.incorrect.exists ? '✅' : '❌'} ${checkResults.soundEffects.incorrect.exists ? '存在' : '不存在'}`)
  
  // 単語音声の結果
  console.log('\n📚 単語音声ファイル:')
  console.log(`  総数: ${checkResults.wordAudio.total}`)
  console.log(`  存在: ${checkResults.wordAudio.exists}`)
  console.log(`  再生可能: ${checkResults.wordAudio.playable}`)
  console.log(`  欠損: ${checkResults.wordAudio.missing}`)
  
  // エラーの詳細
  if (checkResults.wordAudio.errors.length > 0) {
    console.log('\n❌ エラー詳細 (最初の5個):')
    checkResults.wordAudio.errors.slice(0, 5).forEach((error, index) => {
      console.log(`  ${index + 1}. "${error.word}": ${error.error}`)
    })
  }
  
  // 総合結果
  const passRate = checkResults.summary.totalChecks > 0 
    ? (checkResults.summary.passedChecks / checkResults.summary.totalChecks * 100).toFixed(1)
    : 0
  
  console.log('\n📈 総合結果:')
  console.log(`  チェック項目数: ${checkResults.summary.totalChecks}`)
  console.log(`  成功: ${checkResults.summary.passedChecks}`)
  console.log(`  失敗: ${checkResults.summary.failedChecks}`)
  console.log(`  成功率: ${passRate}%`)
  
  // 推奨アクション
  console.log('\n💡 推奨アクション:')
  
  if (!checkResults.soundEffects.correct.exists || !checkResults.soundEffects.incorrect.exists) {
    console.log('1. 効果音ファイルをSupabase Storageにアップロード')
    console.log('   - se/collect.mp3 (正解音)')
    console.log('   - se/error.mp3 (不正解音)')
  }
  
  if (checkResults.wordAudio.missing > 0) {
    console.log(`2. ${checkResults.wordAudio.missing}個の単語音声ファイルをアップロード`)
  }
  
  if (checkResults.wordAudio.playable < checkResults.wordAudio.exists) {
    console.log('3. 破損した音声ファイルを修復または再アップロード')
  }
  
  console.log('4. ブラウザでの音声再生テストを実行')
  console.log('   - temp-audio-test.htmlを開く')
  console.log('   - 各音声ボタンをクリックしてテスト')
  
  // 最終判定
  const isPassing = checkResults.soundEffects.correct.exists && 
                   checkResults.soundEffects.incorrect.exists &&
                   checkResults.wordAudio.playable > 0
  
  console.log(`\n🎯 最終判定: ${isPassing ? '✅ 合格' : '❌ 不合格'}`)
  
  if (!isPassing) {
    console.log('   Quiz音声機能に問題があります。上記の推奨アクションを実行してください。')
  } else {
    console.log('   Quiz音声機能は正常に動作する見込みです。')
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🎵 Quiz音声ファイル再生チェックを開始...')
    console.log('=' .repeat(50))
    
    // 1. 効果音ファイルの確認
    await checkSoundEffects()
    
    // 2. 単語音声ファイルの確認
    await checkWordAudio()
    
    // 3. ブラウザ環境でのテスト準備
    await testBrowserAudioPlayback()
    
    // 4. 結果レポートの生成
    generateReport()
    
    console.log('\n✅ チェック完了!')
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

// スクリプト実行
main()
