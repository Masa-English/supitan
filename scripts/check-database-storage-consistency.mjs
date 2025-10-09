#!/usr/bin/env node

/**
 * WordsテーブルとStorageの整合性確認スクリプト
 * 
 * このスクリプトは以下の確認を行います：
 * 1. Wordsテーブルの全データを取得
 * 2. Storage内の全ファイル構造を分析
 * 3. audio_fileフィールドとStorageファイルの整合性確認
 * 4. 問題のあるファイルの詳細レポート
 * 5. 修正推奨アクションの提示
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
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
  database: {
    totalWords: 0,
    wordsWithAudioFile: 0,
    wordsWithoutAudioFile: 0,
    words: []
  },
  storage: {
    totalFolders: 0,
    totalFiles: 0,
    folders: [],
    files: []
  },
  consistency: {
    perfectMatch: 0,
    partialMatch: 0,
    noMatch: 0,
    orphanedFiles: 0,
    missingFiles: 0,
    problems: []
  },
  summary: {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0
  }
}

/**
 * データベースのWordsテーブルから全データを取得
 */
async function fetchDatabaseWords() {
  console.log('📊 データベースのWordsテーブルから全データを取得中...')
  
  try {
    const { data: words, error } = await supabase
      .from('words')
      .select('id, word, audio_file, category, section')
      .order('word')
    
    if (error) {
      throw new Error(`Wordsテーブル取得エラー: ${error.message}`)
    }
    
    checkResults.database.totalWords = words.length
    checkResults.database.wordsWithAudioFile = words.filter(w => w.audio_file).length
    checkResults.database.wordsWithoutAudioFile = words.filter(w => !w.audio_file).length
    checkResults.database.words = words
    
    console.log(`  ✅ 総単語数: ${words.length}`)
    console.log(`  ✅ audio_file設定済み: ${checkResults.database.wordsWithAudioFile}`)
    console.log(`  ❌ audio_file未設定: ${checkResults.database.wordsWithoutAudioFile}`)
    
    return words
  } catch (error) {
    console.error('💥 データベース取得エラー:', error)
    throw error
  }
}

/**
 * Storage内の全ファイル構造を分析
 */
async function analyzeStorageStructure() {
  console.log('\n📁 Storage内の全ファイル構造を分析中...')
  
  try {
    // 全ファイルを再帰的に取得
    const allFiles = await listAllStorageFiles()
    
    checkResults.storage.totalFiles = allFiles.length
    
    // フォルダ構造を分析
    const folderMap = new Map()
    const fileMap = new Map()
    
    for (const file of allFiles) {
      // Supabase Storageのlist()はフォルダとファイルを区別して返す
      // フォルダは通常、nameに拡張子がなく、metadataがnullまたは異なる
      if (file.metadata === null || !file.name.includes('.')) {
        // これはフォルダ
        folderMap.set(file.name, [])
        
        // フォルダ内のファイルを取得
        try {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from('audio-files')
            .list(file.name)
          
          if (!folderError && folderFiles) {
            folderMap.set(file.name, folderFiles.map(f => ({
              name: f.name,
              size: f.metadata?.size || 0,
              lastModified: f.updated_at,
              fullPath: `${file.name}/${f.name}`
            })))
          }
        } catch (error) {
          console.warn(`フォルダ ${file.name} の内容取得エラー:`, error.message)
        }
      } else {
        // これはファイル
        fileMap.set(file.name, file)
      }
    }
    
    checkResults.storage.totalFolders = folderMap.size
    checkResults.storage.folders = Array.from(folderMap.entries()).map(([name, files]) => ({
      name,
      fileCount: files.length,
      files: files.map(f => ({
        name: f.name.split('/')[1] || f.name,
        size: f.metadata?.size || 0,
        lastModified: f.updated_at
      }))
    }))
    
    console.log(`  ✅ 総フォルダ数: ${folderMap.size}`)
    console.log(`  ✅ 総ファイル数: ${allFiles.length}`)
    
    // フォルダの例を表示
    console.log('\n📁 フォルダ構造の例（最初の10個）:')
    checkResults.storage.folders.slice(0, 10).forEach((folder, index) => {
      console.log(`  ${index + 1}. ${folder.name} (${folder.fileCount}ファイル)`)
      folder.files.slice(0, 3).forEach(file => {
        console.log(`     - ${file.name} (${file.size} bytes)`)
      })
      if (folder.files.length > 3) {
        console.log(`     ... 他${folder.files.length - 3}ファイル`)
      }
    })
    
    return { folderMap, fileMap }
  } catch (error) {
    console.error('💥 Storage分析エラー:', error)
    throw error
  }
}

/**
 * Storage内の全ファイルを再帰的に取得
 */
async function listAllStorageFiles(path = '', limit = 1000) {
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
      throw new Error(`Storageファイル一覧取得エラー: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      break
    }
    
    // 各アイテムにパス情報を追加
    const itemsWithPath = data.map(item => ({
      ...item,
      fullPath: path ? `${path}/${item.name}` : item.name
    }))
    
    allFiles.push(...itemsWithPath)
    offset += limit
    
    if (data.length < limit) {
      break
    }
  }
  
  return allFiles
}

/**
 * データベースとStorageの整合性確認
 */
async function checkConsistency(words, storageData) {
  console.log('\n🔄 データベースとStorageの整合性確認中...')
  
  const { folderMap, fileMap } = storageData
  const problems = []
  
  for (const word of words) {
    const wordId = word.id
    const wordText = word.word
    const audioFile = word.audio_file
    
    // audio_fileが設定されている場合の確認
    if (audioFile) {
      const folderName = audioFile.replace('/word.mp3', '')
      const storageFolder = folderMap.get(folderName)
      
      if (!storageFolder) {
        // Storageにフォルダが存在しない
        problems.push({
          type: 'missing_folder',
          wordId,
          word: wordText,
          audioFile,
          folderName,
          severity: 'high',
          description: `フォルダ "${folderName}" がStorageに存在しません`
        })
        checkResults.consistency.noMatch++
      } else {
        // フォルダは存在するが、期待されるファイルがあるかチェック
        const hasWordMp3 = storageFolder.some(f => f.name === 'word.mp3')
        const hasExample00001 = storageFolder.some(f => f.name === 'example00001.mp3')
        const hasExample00002 = storageFolder.some(f => f.name === 'example00002.mp3')
        const hasExample00003 = storageFolder.some(f => f.name === 'example00003.mp3')
        
        if (hasWordMp3 || hasExample00001) {
          // 主要な音声ファイルが存在する
          if (hasWordMp3 && hasExample00001 && hasExample00002 && hasExample00003) {
            checkResults.consistency.perfectMatch++
          } else {
            checkResults.consistency.partialMatch++
            problems.push({
              type: 'partial_files',
              wordId,
              word: wordText,
              audioFile,
              folderName,
              severity: 'medium',
              description: `フォルダ "${folderName}" に一部の音声ファイルが不足しています`,
              details: {
                hasWordMp3,
                hasExample00001,
                hasExample00002,
                hasExample00003
              }
            })
          }
        } else {
          // 音声ファイルが存在しない
          problems.push({
            type: 'missing_audio_files',
            wordId,
            word: wordText,
            audioFile,
            folderName,
            severity: 'high',
            description: `フォルダ "${folderName}" に音声ファイルが存在しません`
          })
          checkResults.consistency.noMatch++
        }
      }
    } else {
      // audio_fileが設定されていない場合
      problems.push({
        type: 'no_audio_file',
        wordId,
        word: wordText,
        audioFile: null,
        folderName: null,
        severity: 'medium',
        description: `単語 "${wordText}" にaudio_fileが設定されていません`
      })
    }
    
    checkResults.summary.totalChecks++
  }
  
  // 孤立したファイル（Storageにあるがデータベースにない）をチェック
  console.log('\n🔍 孤立したファイル（Storageにあるがデータベースにない）をチェック中...')
  
  const dbFolderNames = new Set(words.map(w => w.audio_file?.replace('/word.mp3', '')).filter(Boolean))
  
  for (const [folderName, files] of folderMap) {
    if (!dbFolderNames.has(folderName)) {
      checkResults.consistency.orphanedFiles++
      problems.push({
        type: 'orphaned_folder',
        wordId: null,
        word: null,
        audioFile: null,
        folderName,
        severity: 'low',
        description: `フォルダ "${folderName}" がデータベースに存在しません（孤立ファイル）`,
        details: {
          fileCount: files.length,
          files: files.map(f => f.name)
        }
      })
    }
  }
  
  checkResults.consistency.problems = problems
  checkResults.summary.passedChecks = checkResults.consistency.perfectMatch
  checkResults.summary.failedChecks = problems.length
  
  console.log(`  ✅ 完全一致: ${checkResults.consistency.perfectMatch}`)
  console.log(`  ⚠️  部分一致: ${checkResults.consistency.partialMatch}`)
  console.log(`  ❌ 不一致: ${checkResults.consistency.noMatch}`)
  console.log(`  📁 孤立ファイル: ${checkResults.consistency.orphanedFiles}`)
}

/**
 * 詳細レポートの生成
 */
function generateDetailedReport() {
  console.log('\n📊 詳細レポート')
  console.log('=' .repeat(60))
  
  // データベース統計
  console.log('\n📊 データベース統計:')
  console.log(`  総単語数: ${checkResults.database.totalWords}`)
  console.log(`  audio_file設定済み: ${checkResults.database.wordsWithAudioFile}`)
  console.log(`  audio_file未設定: ${checkResults.database.wordsWithoutAudioFile}`)
  
  // Storage統計
  console.log('\n📁 Storage統計:')
  console.log(`  総フォルダ数: ${checkResults.storage.totalFolders}`)
  console.log(`  総ファイル数: ${checkResults.storage.totalFiles}`)
  
  // 整合性統計
  console.log('\n🔄 整合性統計:')
  console.log(`  完全一致: ${checkResults.consistency.perfectMatch}`)
  console.log(`  部分一致: ${checkResults.consistency.partialMatch}`)
  console.log(`  不一致: ${checkResults.consistency.noMatch}`)
  console.log(`  孤立ファイル: ${checkResults.consistency.orphanedFiles}`)
  
  // 問題の詳細
  if (checkResults.consistency.problems.length > 0) {
    console.log('\n❌ 問題の詳細:')
    
    // 重要度別に分類
    const highSeverity = checkResults.consistency.problems.filter(p => p.severity === 'high')
    const mediumSeverity = checkResults.consistency.problems.filter(p => p.severity === 'medium')
    const lowSeverity = checkResults.consistency.problems.filter(p => p.severity === 'low')
    
    if (highSeverity.length > 0) {
      console.log('\n🔴 高重要度の問題:')
      highSeverity.slice(0, 10).forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem.description}`)
        if (problem.word) {
          console.log(`     単語: "${problem.word}" (ID: ${problem.wordId})`)
        }
        if (problem.folderName) {
          console.log(`     フォルダ: ${problem.folderName}`)
        }
      })
      if (highSeverity.length > 10) {
        console.log(`     ... 他${highSeverity.length - 10}個の問題`)
      }
    }
    
    if (mediumSeverity.length > 0) {
      console.log('\n🟡 中重要度の問題:')
      mediumSeverity.slice(0, 5).forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem.description}`)
        if (problem.word) {
          console.log(`     単語: "${problem.word}" (ID: ${problem.wordId})`)
        }
      })
      if (mediumSeverity.length > 5) {
        console.log(`     ... 他${mediumSeverity.length - 5}個の問題`)
      }
    }
    
    if (lowSeverity.length > 0) {
      console.log('\n🟢 低重要度の問題:')
      lowSeverity.slice(0, 3).forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem.description}`)
        if (problem.folderName) {
          console.log(`     フォルダ: ${problem.folderName}`)
        }
      })
      if (lowSeverity.length > 3) {
        console.log(`     ... 他${lowSeverity.length - 3}個の問題`)
      }
    }
  }
  
  // 推奨アクション
  console.log('\n💡 推奨アクション:')
  
  const highProblems = checkResults.consistency.problems.filter(p => p.severity === 'high')
  const mediumProblems = checkResults.consistency.problems.filter(p => p.severity === 'medium')
  const lowProblems = checkResults.consistency.problems.filter(p => p.severity === 'low')
  
  if (highProblems.length > 0) {
    console.log(`1. 高重要度の問題 (${highProblems.length}個) を優先的に修正`)
    console.log('   - 存在しないフォルダの作成')
    console.log('   - 不足している音声ファイルのアップロード')
  }
  
  if (mediumProblems.length > 0) {
    console.log(`2. 中重要度の問題 (${mediumProblems.length}個) を修正`)
    console.log('   - audio_fileフィールドの設定')
    console.log('   - 部分的な音声ファイルの補完')
  }
  
  if (lowProblems.length > 0) {
    console.log(`3. 低重要度の問題 (${lowProblems.length}個) を整理`)
    console.log('   - 孤立ファイルの削除またはデータベースへの追加')
  }
  
  // 最終判定
  const totalProblems = checkResults.consistency.problems.length
  const passRate = checkResults.summary.totalChecks > 0 
    ? (checkResults.summary.passedChecks / checkResults.summary.totalChecks * 100).toFixed(1)
    : 0
  
  console.log('\n🎯 最終判定:')
  console.log(`  チェック項目数: ${checkResults.summary.totalChecks}`)
  console.log(`  成功: ${checkResults.summary.passedChecks}`)
  console.log(`  問題: ${totalProblems}`)
  console.log(`  成功率: ${passRate}%`)
  
  if (totalProblems === 0) {
    console.log('  ✅ 完全に整合性が取れています')
  } else if (highProblems.length === 0) {
    console.log('  ⚠️  軽微な問題がありますが、基本的には動作します')
  } else {
    console.log('  ❌ 重要な問題があります。修正が必要です')
  }
}

/**
 * CSVレポートの生成
 */
function generateCSVReport() {
  console.log('\n📄 CSVレポートを生成中...')
  
  const csvContent = [
    // ヘッダー
    ['Word ID', 'Word', 'Audio File', 'Folder Name', 'Status', 'Severity', 'Description'].join(','),
    
    // データ
    ...checkResults.consistency.problems.map(problem => [
      problem.wordId || '',
      problem.word || '',
      problem.audioFile || '',
      problem.folderName || '',
      problem.type,
      problem.severity,
      `"${problem.description}"`
    ].join(','))
  ].join('\n')
  
  const csvFile = path.join(process.cwd(), 'consistency-report.csv')
  fs.writeFileSync(csvFile, csvContent)
  
  console.log(`  📁 CSVファイルを生成しました: ${csvFile}`)
  console.log(`  📊 問題数: ${checkResults.consistency.problems.length}`)
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🔍 WordsテーブルとStorageの整合性確認を開始...')
    console.log('=' .repeat(60))
    
    // 1. データベースのWordsテーブルから全データを取得
    const words = await fetchDatabaseWords()
    
    // 2. Storage内の全ファイル構造を分析
    const storageData = await analyzeStorageStructure()
    
    // 3. データベースとStorageの整合性確認
    await checkConsistency(words, storageData)
    
    // 4. 詳細レポートの生成
    generateDetailedReport()
    
    // 5. CSVレポートの生成
    generateCSVReport()
    
    console.log('\n✅ 整合性確認完了!')
    
  } catch (error) {
    console.error('💥 スクリプト実行エラー:', error)
    process.exit(1)
  }
}

// スクリプト実行
main()
