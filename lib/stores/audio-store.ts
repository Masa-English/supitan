'use client';

import { create } from 'zustand';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { fetchAudioFromStorage } from '@/lib/utils/audio';
import { devLog } from '@/lib/utils';
import clientLogger, { LogCategory } from '@/lib/utils/client-logger';

interface AudioState {
  // 音声状態
  isMuted: boolean;
  volume: number;
  correctAudio: HTMLAudioElement | null;
  incorrectAudio: HTMLAudioElement | null;
  wordAudioCache: Map<string, HTMLAudioElement>;
  wordAudioPathCache: Map<string, string>;
  
  // 状態管理
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAudioEnabled: boolean; // 音声再生の有効/無効フラグ
  
  // アクション
  initializeAudio: () => Promise<void>;
  loadWordAudio: (wordId: string, audioFilePath: string) => Promise<HTMLAudioElement | null>;
  preloadWordAudioPaths: (words: { id: string; audio_file: string | null }[]) => void;
  playCorrectSound: () => Promise<void>;
  playIncorrectSound: () => Promise<void>;
  playWordAudio: (wordId: string) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  toggleAudioEnabled: () => void; // 音声有効/無効を切り替え
  clearCache: () => void; // キャッシュクリア
  cleanup: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // 初期状態
  isMuted: false,
  volume: 0.7,
  correctAudio: null,
  incorrectAudio: null,
  wordAudioCache: new Map(),
  wordAudioPathCache: new Map(),
  isLoading: false,
  error: null,
  isInitialized: false,
  isAudioEnabled: true, // 初期状態では音声再生を有効にする

  // 音声初期化
  initializeAudio: async () => {
    const { isInitialized } = get();

    clientLogger.audio('initializeAudio呼び出し', { isInitialized });

    if (isInitialized) {
      clientLogger.audio('既に初期化済みのためスキップ');
      return;
    }

    clientLogger.audio('音声初期化開始');
    set({ isLoading: true, error: null });

    try {
      const supabase = createBrowserClient();
      clientLogger.audio('Supabaseクライアント作成完了');

      // 効果音ファイルの取得を並行して実行
      clientLogger.audio('効果音ファイル取得開始');
      const [correctResult, incorrectResult] = await Promise.allSettled([
        supabase.storage.from('se').download('collect.mp3'),
        supabase.storage.from('se').download('error.mp3')
      ]);

      console.log('[AudioStore] 効果音ファイル取得結果', {
        correctResult: correctResult.status === 'fulfilled' ? '成功' : correctResult.reason,
        incorrectResult: incorrectResult.status === 'fulfilled' ? '成功' : incorrectResult.reason
      });

      // 効果音ファイルの取得結果を処理
      let correctData = null;
      let incorrectData = null;
      let hasAudioError = false;

      if (correctResult.status === 'fulfilled' && correctResult.value.data) {
        correctData = correctResult.value.data;
      } else {
        console.warn('[AudioStore] 正解音ファイル取得失敗:', correctResult.status === 'rejected' ? correctResult.reason : 'データなし');
        hasAudioError = true;
      }

      if (incorrectResult.status === 'fulfilled' && incorrectResult.value.data) {
        incorrectData = incorrectResult.value.data;
      } else {
        console.warn('[AudioStore] 不正解音ファイル取得失敗:', incorrectResult.status === 'rejected' ? incorrectResult.reason : 'データなし');
        hasAudioError = true;
      }

      // 効果音ファイルが取得できない場合でも初期化を継続（フォールバック対応）
      if (hasAudioError) {
        devLog.warn('効果音ファイルの取得に失敗しましたが、初期化を継続します。', {
          correctError: correctResult.status === 'rejected' ? correctResult.reason : null,
          incorrectError: incorrectResult.status === 'rejected' ? incorrectResult.reason : null
        });

        // 効果音なしで初期化を継続
        set({
          isLoading: false,
          error: null, // エラーなしとして扱う
          isInitialized: true
        });
        devLog.log('[AudioStore] 効果音なしで音声初期化完了');
        clientLogger.audio('効果音なしで音声初期化完了');
        return;
      }

      console.log('[AudioStore] BlobからAudioオブジェクト作成開始');
      // BlobからAudioオブジェクトを作成
      const correctBlob = new Blob([correctData!], { type: 'audio/mpeg' });
      const incorrectBlob = new Blob([incorrectData!], { type: 'audio/mpeg' });

      const correctUrl = URL.createObjectURL(correctBlob);
      const incorrectUrl = URL.createObjectURL(incorrectBlob);

      // 既存の音声がある場合はURLを解放
      const { correctAudio: existingCorrect, incorrectAudio: existingIncorrect } = get();
      if (existingCorrect && existingCorrect.src.startsWith('blob:')) {
        URL.revokeObjectURL(existingCorrect.src);
      }
      if (existingIncorrect && existingIncorrect.src.startsWith('blob:')) {
        URL.revokeObjectURL(existingIncorrect.src);
      }

      const correctAudio = new Audio(correctUrl);
      const incorrectAudio = new Audio(incorrectUrl);

      // 音声の設定
      correctAudio.volume = get().volume;
      incorrectAudio.volume = get().volume;

      clientLogger.audio('Audioオブジェクト作成完了', {
        correctAudio: !!correctAudio,
        incorrectAudio: !!incorrectAudio,
        volume: get().volume
      });

      set({
        correctAudio,
        incorrectAudio,
        isLoading: false,
        isInitialized: true,
        error: null
      });

      devLog.log('[AudioStore] 音声初期化完了');
      clientLogger.audio('音声初期化完了');
    } catch (error) {
      clientLogger.error('音声初期化エラー', LogCategory.ERROR, { error: error instanceof Error ? error.message : String(error) });
      // エラーが発生した場合でも初期化済みとしてマーク（効果音なしで動作）
      set({
        isLoading: false,
        error: null,
        isInitialized: true
      });
      devLog.log('[AudioStore] エラー発生後も初期化完了（効果音なしで動作）');
    }
  },

  // 単語音声読み込み
  loadWordAudio: async (wordId: string, audioFilePath: string) => {
    try {
      const audioBlob = await fetchAudioFromStorage(audioFilePath);
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // 既存の音声がある場合はURLを解放
        const { wordAudioCache } = get();
        const existingAudio = wordAudioCache.get(wordId);
        if (existingAudio && existingAudio.src.startsWith('blob:')) {
          URL.revokeObjectURL(existingAudio.src);
        }
        
        wordAudioCache.set(wordId, audio);
        set({ wordAudioCache: new Map(wordAudioCache) });
        devLog.log(`[AudioStore] 単語音声読み込み完了: ${wordId}`);
        return audio;
      }
      return null;
    } catch (error) {
      console.error(`単語音声読み込みエラー: ${wordId}`, error);
      return null;
    }
  },

  // 音声パス事前読み込み
  preloadWordAudioPaths: (words: { id: string; audio_file: string | null }[]) => {
    const { wordAudioPathCache } = get();
    const pathCache = new Map(wordAudioPathCache);
    
    words.forEach(word => {
      if (word.audio_file && !pathCache.has(word.id)) {
        pathCache.set(word.id, word.audio_file);
      }
    });
    
    set({ wordAudioPathCache: pathCache });
    devLog.log(`[AudioStore] 音声パスキャッシュ更新: ${pathCache.size}件追加`);
  },

  // 正解音再生
  playCorrectSound: async () => {
    const { correctAudio, isMuted, volume, isInitialized, isAudioEnabled } = get();
    
    console.log('[AudioStore] playCorrectSound呼び出し', {
      correctAudio: !!correctAudio,
      isMuted,
      volume,
      isInitialized,
      isAudioEnabled
    });
    
    // 音声が初期化されていない場合はスキップ
    if (!isInitialized) {
      console.log('[AudioStore] 音声が初期化されていないため音声再生をスキップ');
      return;
    }
    
    if (!isAudioEnabled) {
      console.log('[AudioStore] 音声再生が無効化されているため音声再生をスキップ');
      return;
    }

    if (isMuted) {
      console.log('[AudioStore] ミュート中なので音声再生をスキップ');
      return;
    }
    
    try {
      if (correctAudio) {
        correctAudio.volume = volume;
        correctAudio.currentTime = 0;
        await correctAudio.play().catch(error => {
          console.error('[AudioStore] 正解音再生エラー:', error);
          // ユーザーに音声再生エラーを通知（必要に応じて）
          devLog.warn('[AudioStore] 正解音再生に失敗しました', error);
        });
        console.log('[AudioStore] 正解音再生開始');
      } else {
        console.warn('[AudioStore] 正解音Audioオブジェクトが存在しません');
      }
    } catch (error) {
      console.error('[AudioStore] 正解音再生エラー:', error);
      devLog.error('[AudioStore] 正解音再生で予期しないエラーが発生しました', error);
    }
  },

  // 不正解音再生
  playIncorrectSound: async () => {
    const { incorrectAudio, isMuted, volume, isInitialized, isAudioEnabled } = get();
    
    console.log('[AudioStore] playIncorrectSound呼び出し', {
      incorrectAudio: !!incorrectAudio,
      isMuted,
      volume,
      isInitialized,
      isAudioEnabled
    });
    
    // 音声が初期化されていない場合はスキップ
    if (!isInitialized) {
      console.log('[AudioStore] 音声が初期化されていないため音声再生をスキップ');
      return;
    }
    
    if (!isAudioEnabled) {
      console.log('[AudioStore] 音声再生が無効化されているため音声再生をスキップ');
      return;
    }

    if (isMuted) {
      console.log('[AudioStore] ミュート中なので音声再生をスキップ');
      return;
    }
    
    try {
      if (incorrectAudio) {
        incorrectAudio.volume = volume;
        incorrectAudio.currentTime = 0;
        await incorrectAudio.play().catch(error => {
          console.error('[AudioStore] 不正解音再生エラー:', error);
          // ユーザーに音声再生エラーを通知（必要に応じて）
          devLog.warn('[AudioStore] 不正解音再生に失敗しました', error);
        });
        console.log('[AudioStore] 不正解音再生開始');
      } else {
        console.warn('[AudioStore] 不正解音Audioオブジェクトが存在しません');
      }
    } catch (error) {
      console.error('[AudioStore] 不正解音再生エラー:', error);
      devLog.error('[AudioStore] 不正解音再生で予期しないエラーが発生しました', error);
    }
  },

  // 単語音声再生
  playWordAudio: async (wordId: string) => {
    const { wordAudioCache, wordAudioPathCache, isMuted, volume, loadWordAudio, isAudioEnabled } = get();

    if (!isAudioEnabled) return;

    let audio = wordAudioCache.get(wordId);

    // キャッシュにない場合は動的に読み込み
    if (!audio) {
      devLog.log(`[AudioStore] キャッシュに音声ファイルなし、動的読み込み開始: ${wordId}`);

      // まず音声パスキャッシュから確認
      let audioFilePath = wordAudioPathCache.get(wordId);

      if (!audioFilePath) {
        try {
          // データベースから音声ファイルパスを取得
          const supabase = createBrowserClient();
          const { data: word, error: wordError } = await supabase
            .from('words')
            .select('audio_file, word')
            .eq('id', wordId)
            .single();

          if (wordError || !word?.audio_file) {
            devLog.warn(`[AudioStore] データベースから音声ファイルパスが見つかりません: ${wordId}`, wordError);
            return;
          }

          audioFilePath = word.audio_file;
          devLog.log(`[AudioStore] データベースから音声ファイルパス取得: ${audioFilePath} (${word.word})`);
        } catch (error) {
          devLog.error(`[AudioStore] データベースからの音声ファイル取得エラー: ${wordId}`, error);
          return;
        }
      } else {
        devLog.log(`[AudioStore] キャッシュから音声ファイルパス取得: ${audioFilePath}`);
      }

      // 音声ファイルパスが確保できない場合は早期リターン
      if (!audioFilePath) {
        devLog.error(`[AudioStore] 音声ファイルパスが取得できませんでした: ${wordId}`);
        return;
      }

      // パス解決を試行（データベースのパスが実際のStorage構造と一致しない場合のフォールバック）
      let resolvedPath = audioFilePath;

      // パス解決の優先順位:
      // 1. フォルダ名のみの場合（例: "from_now_on"）→ "from_now_on/word.mp3" を試行
      // 2. 既に"/word.mp3"で終わっている場合 → そのまま使用
      // 3. その他の場合 → そのまま使用
      
      if (!audioFilePath.includes('/') && !audioFilePath.endsWith('.mp3')) {
        // フォルダ名のみの場合（例: "from_now_on"）
        resolvedPath = `${audioFilePath}/word.mp3`;
        devLog.log(`[AudioStore] フォルダ名のみのパスを修正: ${audioFilePath} → ${resolvedPath}`);
      } else if (audioFilePath.endsWith('/word.mp3')) {
        // 既に"/word.mp3"で終わっている場合はそのまま使用
        devLog.log(`[AudioStore] word.mp3パスをそのまま使用: ${audioFilePath}`);
      } else {
        // その他の場合はそのまま使用
        devLog.log(`[AudioStore] パスをそのまま使用: ${audioFilePath}`);
      }

      // 音声ファイルを読み込み
      const loadedAudio = await loadWordAudio(wordId, resolvedPath);
      audio = loadedAudio || undefined;
      if (!audio) {
        devLog.warn(`[AudioStore] 音声ファイルの読み込みに失敗しました: ${resolvedPath}`);
        return;
      }
    } else {
      devLog.log(`[AudioStore] キャッシュから音声ファイル取得: ${wordId}`);
    }

    // 音声を再生
    if (audio && !isMuted) {
      try {
        audio.volume = volume;
        audio.currentTime = 0;
        await audio.play();
        devLog.log(`[AudioStore] 単語音声再生完了: ${wordId}`);
      } catch (error) {
        console.error(`単語音声再生エラー: ${wordId}`, error);
        devLog.error(`[AudioStore] 単語音声再生エラー: ${wordId}`, error);
      }
    }
  },

  // ミュート切り替え
  toggleMute: () => {
    set(state => ({ isMuted: !state.isMuted }));
  },

  // 音量設定
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ volume: clampedVolume });
    
    // 既存の音声オブジェクトの音量も更新
    const { correctAudio, incorrectAudio } = get();
    if (correctAudio) correctAudio.volume = clampedVolume;
    if (incorrectAudio) incorrectAudio.volume = clampedVolume;
  },

  // 音声有効/無効を切り替え
  toggleAudioEnabled: () => {
    set(state => ({ isAudioEnabled: !state.isAudioEnabled }));
    devLog.log(`[AudioStore] 音声再生有効/無効切り替え: ${get().isAudioEnabled ? '有効' : '無効'}`);
  },

  // キャッシュクリア
  clearCache: () => {
    const { wordAudioCache } = get();
    
    // キャッシュされた音声の停止とリソース解放
    wordAudioCache.forEach(audio => {
      audio.pause();
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    });
    
    // キャッシュをクリア
    set({
      wordAudioCache: new Map(),
      wordAudioPathCache: new Map(),
    });
    
    devLog.log('[AudioStore] キャッシュクリア完了');
  },

  // クリーンアップ
  cleanup: () => {
    const { correctAudio, incorrectAudio, wordAudioCache } = get();
    
    // 音声オブジェクトの停止とリソース解放
    if (correctAudio) {
      correctAudio.pause();
      correctAudio.src = '';
      // URL.createObjectURLで作成されたURLを解放
      if (correctAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(correctAudio.src);
      }
    }
    if (incorrectAudio) {
      incorrectAudio.pause();
      incorrectAudio.src = '';
      // URL.createObjectURLで作成されたURLを解放
      if (incorrectAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(incorrectAudio.src);
      }
    }
    
    // キャッシュされた音声の停止とリソース解放
    wordAudioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
      // URL.createObjectURLで作成されたURLを解放
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    });
    
    // 状態リセット
    set({
      correctAudio: null,
      incorrectAudio: null,
      wordAudioCache: new Map(),
      wordAudioPathCache: new Map(),
      isInitialized: false,
      isAudioEnabled: true, // クリーンアップ後も音声再生を有効にする
    });
    
    devLog.log('[AudioStore] クリーンアップ完了');
  },
}));
