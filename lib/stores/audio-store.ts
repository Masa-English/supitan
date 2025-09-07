'use client';

import { create } from 'zustand';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { fetchAudioFromStorage } from '@/lib/utils/audio';
import { devLog } from '@/lib/utils';

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
    
    console.log('[AudioStore] initializeAudio呼び出し', { isInitialized });
    
    if (isInitialized) {
      console.log('[AudioStore] 既に初期化済みのためスキップ');
      return;
    }

    console.log('[AudioStore] 音声初期化開始');
    set({ isLoading: true, error: null });
    
    try {
      const supabase = createBrowserClient();
      console.log('[AudioStore] Supabaseクライアント作成完了');
      
      // Supabase Storageから効果音ファイルを取得
      console.log('[AudioStore] 効果音ファイル取得開始');
      const { data: correctData, error: correctError } = await supabase.storage
        .from('se')
        .download('collect.mp3');
      
      const { data: incorrectData, error: incorrectError } = await supabase.storage
        .from('se')
        .download('error.mp3');

      console.log('[AudioStore] 効果音ファイル取得結果', {
        correctData: !!correctData,
        correctError,
        incorrectData: !!incorrectData,
        incorrectError
      });

      // 音声ファイルの取得に失敗した場合の処理
      if (correctError || incorrectError) {
        devLog.warn('効果音ファイルの取得に失敗しました。', {
          correctError,
          incorrectError
        });
        
        console.error('[AudioStore] 効果音ファイル取得エラー', {
          correctError,
          incorrectError
        });
        
        set({
          isLoading: false,
          error: '効果音ファイルの取得に失敗しました。',
          isInitialized: true
        });
        return;
      }

      console.log('[AudioStore] BlobからAudioオブジェクト作成開始');
      // BlobからAudioオブジェクトを作成
      const correctBlob = new Blob([correctData], { type: 'audio/mpeg' });
      const incorrectBlob = new Blob([incorrectData], { type: 'audio/mpeg' });
      
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

      console.log('[AudioStore] Audioオブジェクト作成完了', {
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
      console.log('[AudioStore] 音声初期化完了');
    } catch (error) {
      console.error('[AudioStore] 音声初期化エラー:', error);
      set({
        isLoading: false,
        error: '音声の初期化に失敗しました',
        isInitialized: true
      });
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
          // データベースから音声ファイルパスを取得（フォールバック）
          const supabase = createBrowserClient();
          const { data: word, error: wordError } = await supabase
            .from('words')
            .select('audio_file')
            .eq('id', wordId)
            .single();

          if (wordError || !word?.audio_file) {
            devLog.warn(`[AudioStore] 音声ファイルが見つかりません: ${wordId}`, wordError);
            return;
          }
          
          audioFilePath = word.audio_file;
          devLog.log(`[AudioStore] データベースから音声ファイルパス取得: ${audioFilePath}`);
        } catch (error) {
          devLog.error(`[AudioStore] 音声ファイル取得エラー: ${wordId}`, error);
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

      // 音声ファイルを読み込み
      const loadedAudio = await loadWordAudio(wordId, audioFilePath);
      audio = loadedAudio || undefined;
      if (!audio) {
        devLog.warn(`[AudioStore] 音声ファイルの読み込みに失敗しました: ${audioFilePath}`);
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
