'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { fetchAudioFromStorage } from '@/lib/audio-utils';
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
  
  // アクション
  initializeAudio: () => Promise<void>;
  loadWordAudio: (wordId: string, audioFilePath: string) => Promise<HTMLAudioElement | null>;
  preloadWordAudioPaths: (words: { id: string; audio_file: string | null }[]) => void;
  playCorrectSound: () => void;
  playIncorrectSound: () => void;
  playWordAudio: (wordId: string) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
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

  // 音声初期化
  initializeAudio: async () => {
    const { isInitialized } = get();
    
    if (isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const supabase = createClient();
      
      // Supabase Storageから効果音ファイルを取得
      const { data: correctData, error: correctError } = await supabase.storage
        .from('se')
        .download('collect.mp3');
      
      const { data: incorrectData, error: incorrectError } = await supabase.storage
        .from('se')
        .download('error.mp3');

      // 音声ファイルの取得に失敗した場合のフォールバック処理
      if (correctError || incorrectError) {
        devLog.warn('効果音ファイルの取得に失敗しました。Web Speech APIを使用します。', {
          correctError,
          incorrectError
        });
        
        set({
          isLoading: false,
          error: '効果音ファイルの取得に失敗しました。Web Speech APIを使用します。',
          isInitialized: true
        });
        return;
      }

      // BlobからAudioオブジェクトを作成
      const correctBlob = new Blob([correctData], { type: 'audio/mpeg' });
      const incorrectBlob = new Blob([incorrectData], { type: 'audio/mpeg' });
      
      const correctUrl = URL.createObjectURL(correctBlob);
      const incorrectUrl = URL.createObjectURL(incorrectBlob);

      const correctAudio = new Audio(correctUrl);
      const incorrectAudio = new Audio(incorrectUrl);

      // 音声の設定
      correctAudio.volume = get().volume;
      incorrectAudio.volume = get().volume;

      set({
        correctAudio,
        incorrectAudio,
        isLoading: false,
        isInitialized: true,
        error: null
      });

      devLog.log('[AudioStore] 音声初期化完了');
    } catch (error) {
      console.error('音声初期化エラー:', error);
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
        const { wordAudioCache } = get();
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
  playCorrectSound: () => {
    const { correctAudio, isMuted, volume } = get();
    
    if (isMuted) return;
    
    try {
      if (correctAudio) {
        correctAudio.volume = volume;
        correctAudio.currentTime = 0;
        correctAudio.play().catch(error => {
          console.error('正解音再生エラー:', error);
          // フォールバックとしてWeb Speech APIを使用
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('正解です！');
            utterance.lang = 'ja-JP';
            utterance.volume = volume;
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            speechSynthesis.speak(utterance);
          }
        });
      } else {
        // フォールバックとしてWeb Speech APIを使用
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('正解です！');
          utterance.lang = 'ja-JP';
          utterance.volume = volume;
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('正解音再生エラー:', error);
    }
  },

  // 不正解音再生
  playIncorrectSound: () => {
    const { incorrectAudio, isMuted, volume } = get();
    
    if (isMuted) return;
    
    try {
      if (incorrectAudio) {
        incorrectAudio.volume = volume;
        incorrectAudio.currentTime = 0;
        incorrectAudio.play().catch(error => {
          console.error('不正解音再生エラー:', error);
          // フォールバックとしてWeb Speech APIを使用
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('不正解です');
            utterance.lang = 'ja-JP';
            utterance.volume = volume;
            utterance.rate = 0.9;
            utterance.pitch = 0.9;
            speechSynthesis.speak(utterance);
          }
        });
      } else {
        // フォールバックとしてWeb Speech APIを使用
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('不正解です');
          utterance.lang = 'ja-JP';
          utterance.volume = volume;
          utterance.rate = 0.9;
          utterance.pitch = 0.9;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('不正解音再生エラー:', error);
    }
  },

  // 単語音声再生
  playWordAudio: async (wordId: string) => {
    const { wordAudioCache, wordAudioPathCache, isMuted, volume, loadWordAudio } = get();

    if (isMuted) return;

    let audio = wordAudioCache.get(wordId);
    
    // キャッシュにない場合は動的に読み込み
    if (!audio) {
      devLog.log(`[AudioStore] キャッシュに音声ファイルなし、動的読み込み開始: ${wordId}`);
      
      // まず音声パスキャッシュから確認
      let audioFilePath = wordAudioPathCache.get(wordId);
      
      if (!audioFilePath) {
        try {
          // データベースから音声ファイルパスを取得（フォールバック）
          const supabase = createClient();
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

  // クリーンアップ
  cleanup: () => {
    const { correctAudio, incorrectAudio, wordAudioCache } = get();
    
    // 音声オブジェクトの停止とリソース解放
    if (correctAudio) {
      correctAudio.pause();
      correctAudio.src = '';
    }
    if (incorrectAudio) {
      incorrectAudio.pause();
      incorrectAudio.src = '';
    }
    
    // キャッシュされた音声の停止
    wordAudioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    
    // 状態リセット
    set({
      correctAudio: null,
      incorrectAudio: null,
      wordAudioCache: new Map(),
      wordAudioPathCache: new Map(),
      isInitialized: false,
    });
    
    devLog.log('[AudioStore] クリーンアップ完了');
  },
}));
