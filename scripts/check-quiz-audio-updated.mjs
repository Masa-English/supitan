#!/usr/bin/env node

/**
 * Quiz音声ファイル再生チェックスクリプト（更新版）
 * 
 * example00001.mp3 ~ example00003.mp3 の命名規則に対応
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
  exampleFiles: {
    example00001: 0,
    example00002: 0,
    example00003: 0,
    wordMp3: 0
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
 * 単語音声ファイルの確認（example00001.mp3 ~ example00003.mp3対応）
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
      
      // フォルダ名を抽出
      const folderName = word.audio_file.replace('/word.mp3', '')
      
      // フォルダ内のファイル一覧を取得
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('audio-files')
        .list(folderName)
      
      if (folderError) {
        console.log(`    ❌ フォルダアクセスエラー: ${folderError.message}`)
        checkResults.wordAudio.missing++
        checkResults.wordAudio.errors.push({
          word: word.word,
          audioFile: word.audio_file,
          error: folderError.message
        })
        checkResults.summary.totalChecks++
        continue
      }
      
      if (!folderFiles || folderFiles.length === 0) {
        console.log(`    📭 フォルダが空です`)
        checkResults.wordAudio.missing++
        checkResults.wordAudio.errors.push({
          word: word.word,
          audioFile: word.audio_file,
          error: 'フォルダが空'
        })
        checkResults.summary.totalChecks++
        continue
      }
      
      // example00001.mp3 ~ example00003.mp3 をチェック
      const example00001 = folderFiles.find(f => f.name === 'example00001.mp3')
      const example00002 = folderFiles.find(f => f.name === 'example00002.mp3')
      const example00003 = folderFiles.find(f => f.name === 'example00003.mp3')
      const wordMp3 = folderFiles.find(f => f.name === 'word.mp3')
      
      let hasPlayableAudio = false
      
      if (example00001) {
        console.log(`    ✅ example00001.mp3 (${example00001.metadata?.size || 'unknown'} bytes)`)
        checkResults.exampleFiles.example00001++
        hasPlayableAudio = true
      }
      
      if (example00002) {
        console.log(`    ✅ example00002.mp3 (${example00002.metadata?.size || 'unknown'} bytes)`)
        checkResults.exampleFiles.example00002++
      }
      
      if (example00003) {
        console.log(`    ✅ example00003.mp3 (${example00003.metadata?.size || 'unknown'} bytes)`)
        checkResults.exampleFiles.example00003++
      }
      
      if (wordMp3) {
        console.log(`    ✅ word.mp3 (${wordMp3.metadata?.size || 'unknown'} bytes)`)
        checkResults.exampleFiles.wordMp3++
        hasPlayableAudio = true
      }
      
      if (hasPlayableAudio) {
        checkResults.wordAudio.exists++
        checkResults.wordAudio.playable++
        checkResults.summary.passedChecks++
      } else {
        console.log(`    ❌ 再生可能な音声ファイルが見つかりません`)
        checkResults.wordAudio.missing++
        checkResults.wordAudio.errors.push({
          word: word.word,
          audioFile: word.audio_file,
          error: '再生可能な音声ファイルなし'
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
    <title>Quiz音声再生テスト（更新版）</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .success { color: green; }
        .error { color: red; }
        button { margin: 5px; padding: 10px; }
    </style>
</head>
<body>
    <h1>Quiz音声再生テスト（更新版）</h1>
    
    <div class="test-section">
        <h3>効果音テスト</h3>
        <button onclick="testSoundEffect('se/collect.mp3', 'correct')">正解音テスト</button>
        <button onclick="testSoundEffect('se/error.mp3', 'incorrect')">不正解音テスト</button>
        <div id="soundEffectResult"></div>
    </div>
    
    <div class="test-section">
        <h3>単語音声テスト（example00001~00003）</h3>
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
            
            // example00001.mp3 ~ example00003.mp3 をテスト
            const testWords = [
                'accept/example00001.mp3', 
                'agree/example00002.mp3', 
                'answer/example00003.mp3',
                'accept/word.mp3'
            ];
            let successCount = 0;
            
            for (const wordPath of testWords) {
                try {
                    const response = await fetch(\`\${SUPABASE_URL}/storage/v1/object/public/audio-files/\${wordPath}\`);
                    if (response.ok) {
                        successCount++;
                        console.log('✅ 成功:', wordPath);
                    } else {
                        console.log('❌ 失敗:', wordPath, response.status);
                    }
                } catch (error) {
                    console.error('単語音声テストエラー:', wordPath, error);
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
  const tempFile = path.join(process.cwd(), 'temp-audio-test-updated.html')
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
  
  // exampleファイルの詳細
  console.log('\n📄 exampleファイル詳細:')
  console.log(`  example00001.mp3: ${checkResults.exampleFiles.example00001}個`)
  console.log(`  example00002.mp3: ${checkResults.exampleFiles.example00002}個`)
  console.log(`  example00003.mp3: ${checkResults.exampleFiles.example00003}個`)
  console.log(`  word.mp3: ${checkResults.exampleFiles.wordMp3}個`)
  
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
    console.log('   - 各単語フォルダにexample00001.mp3 ~ example00003.mp3を配置')
    console.log('   - またはword.mp3を配置')
  }
  
  if (checkResults.exampleFiles.example00001 < checkResults.wordAudio.total) {
    console.log('3. example00001.mp3ファイルの追加')
    console.log(`   - 現在: ${checkResults.exampleFiles.example00001}個`)
    console.log(`   - 必要: ${checkResults.wordAudio.total}個`)
  }
  
  console.log('4. ブラウザでの音声再生テストを実行')
  console.log('   - temp-audio-test-updated.htmlを開く')
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
    console.log(`   example00001.mp3: ${checkResults.exampleFiles.example00001}個利用可能`)
    console.log(`   word.mp3: ${checkResults.exampleFiles.wordMp3}個利用可能`)
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🎵 Quiz音声ファイル再生チェックを開始...（更新版）')
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
