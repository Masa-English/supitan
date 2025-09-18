/**
 * 統一されたオーディオストア
 * 効率的な音声管理とプリロード機能を備えた最適化されたオーディオシステム
 */

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AudioStoreState } from '@/lib/types/stores-unified';
import type { Word } from '@/lib/types';

// ============================================================================
// 定数とユーティリティ
// ============================================================================

/** 音声設定のデフォルト値 */
const DEFAULT_AUDIO_CONFIG = {
  volume: 0.8,
  playbackSpeed: 1.0,
  preloadLimit: 10, // 最大プリロード数
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

/** 音声ファイルのパスを生成 */
const getAudioUrl = (word: Word): string => {
  // 音声ファイルのパスを生成（実際のパス構造に合わせて調整）
  const category = encodeURIComponent(word.category);
  const english = encodeURIComponent(word.word.toLowerCase());
  return `/audio/${category}/${english}.mp3`;
};

/** エラーメッセージを正規化 */
const normalizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Audio playback error occurred';
};

/** 音声要素を作成 */
const createAudioElement = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onLoad);
      audio.removeEventListener('error', onError);
    };
    
    const onLoad = () => {
      cleanup();
      resolve(audio);
    };
    
    const onError = () => {
      cleanup();
      reject(new Error(`Failed to load audio: ${url}`));
    };
    
    audio.addEventListener('canplaythrough', onLoad);
    audio.addEventListener('error', onError);
    audio.preload = 'auto';
    audio.src = url;
  });
};

// ============================================================================
// ストア実装
// ============================================================================

export const useAudioStore = create<AudioStoreState>()(
  subscribeWithSelector((set, get) => ({
    // ============================================================================
    // 初期状態
    // ============================================================================
    
    current: {
      audio: null,
      url: null,
      word: null,
    },
    
    playback: {
      isPlaying: false,
      isLoading: false,
      error: null,
      volume: DEFAULT_AUDIO_CONFIG.volume,
      playbackSpeed: DEFAULT_AUDIO_CONFIG.playbackSpeed,
      isMuted: false,
    },
    
    preloaded: {},

    // ============================================================================
    // 音声再生アクション
    // ============================================================================

    playWordAudio: async (word: Word) => {
      const url = getAudioUrl(word);
      
      set(state => ({
        current: {
          ...state.current,
          word,
        },
      }));
      
      await get().playAudio(url);
    },

    playAudio: async (url: string) => {
      const state = get();
      
      // 現在再生中の音声を停止
      if (state.current.audio && !state.current.audio.paused) {
        state.current.audio.pause();
      }

      // ローディング開始
      set(state => ({
        playback: {
          ...state.playback,
          isLoading: true,
          error: null,
        },
        current: {
          ...state.current,
          url,
        },
      }));

      try {
        // プリロードされた音声があるかチェック
        let audio = state.preloaded[url];
        
        if (!audio) {
          // 新しい音声要素を作成
          audio = await createAudioElement(url);
        }

        // 音声設定を適用
        audio.volume = state.playback.isMuted ? 0 : state.playback.volume;
        audio.playbackRate = state.playback.playbackSpeed;

        // イベントリスナーを設定
        const onPlay = () => {
          set(state => ({
            playback: {
              ...state.playback,
              isPlaying: true,
              isLoading: false,
            },
          }));
        };

        const onPause = () => {
          set(state => ({
            playback: {
              ...state.playback,
              isPlaying: false,
            },
          }));
        };

        const onEnded = () => {
          set(state => ({
            playback: {
              ...state.playback,
              isPlaying: false,
            },
            current: {
              ...state.current,
              audio: null,
              url: null,
              word: null,
            },
          }));
        };

        const onError = (event: Event) => {
          const target = event.target as HTMLAudioElement;
          const errorMessage = target.error?.message || 'Audio playback failed';
          
          set(state => ({
            playback: {
              ...state.playback,
              isPlaying: false,
              isLoading: false,
              error: errorMessage,
            },
          }));
        };

        // 既存のリスナーを削除
        if (state.current.audio) {
          state.current.audio.removeEventListener('play', onPlay);
          state.current.audio.removeEventListener('pause', onPause);
          state.current.audio.removeEventListener('ended', onEnded);
          state.current.audio.removeEventListener('error', onError);
        }

        // 新しいリスナーを追加
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        // 現在の音声を更新
        set(state => ({
          current: {
            ...state.current,
            audio,
          },
        }));

        // 再生開始
        await audio.play();

      } catch (error) {
        const errorMessage = normalizeError(error);
        console.error('Audio playback failed:', error);

        set(state => ({
          playback: {
            ...state.playback,
            isPlaying: false,
            isLoading: false,
            error: errorMessage,
          },
        }));
      }
    },

    pauseAudio: () => {
      const state = get();
      
      if (state.current.audio && !state.current.audio.paused) {
        state.current.audio.pause();
      }
    },

    stopAudio: () => {
      const state = get();
      
      if (state.current.audio) {
        state.current.audio.pause();
        state.current.audio.currentTime = 0;
      }

      set(state => ({
        playback: {
          ...state.playback,
          isPlaying: false,
        },
        current: {
          audio: null,
          url: null,
          word: null,
        },
      }));
    },

    // ============================================================================
    // 音声設定アクション
    // ============================================================================

    setVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      
      set(state => ({
        playback: {
          ...state.playback,
          volume: clampedVolume,
        },
      }));

      // 現在再生中の音声にも適用
      const state = get();
      if (state.current.audio && !state.playback.isMuted) {
        state.current.audio.volume = clampedVolume;
      }
    },

    setPlaybackSpeed: (speed: number) => {
      const clampedSpeed = Math.max(0.25, Math.min(4, speed));
      
      set(state => ({
        playback: {
          ...state.playback,
          playbackSpeed: clampedSpeed,
        },
      }));

      // 現在再生中の音声にも適用
      const state = get();
      if (state.current.audio) {
        state.current.audio.playbackRate = clampedSpeed;
      }
    },

    toggleMute: () => {
      const state = get();
      const newMutedState = !state.playback.isMuted;
      
      set(state => ({
        playback: {
          ...state.playback,
          isMuted: newMutedState,
        },
      }));

      // 現在再生中の音声にも適用
      if (state.current.audio) {
        state.current.audio.volume = newMutedState ? 0 : state.playback.volume;
      }
    },

    // ============================================================================
    // プリロード管理
    // ============================================================================

    preloadAudio: async (urls: string[]) => {
      const state = get();
      const toPreload = urls.slice(0, DEFAULT_AUDIO_CONFIG.preloadLimit);
      
      const preloadPromises = toPreload.map(async (url) => {
        // 既にプリロード済みの場合はスキップ
        if (state.preloaded[url]) {
          return { url, audio: state.preloaded[url] };
        }

        try {
          const audio = await createAudioElement(url);
          return { url, audio };
        } catch (error) {
          console.warn(`Failed to preload audio: ${url}`, error);
          return { url, audio: null };
        }
      });

      try {
        const results = await Promise.allSettled(preloadPromises);
        const newPreloaded: Record<string, HTMLAudioElement> = { ...state.preloaded };

        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.audio) {
            newPreloaded[result.value.url] = result.value.audio;
          }
        });

        set(_state => ({
          preloaded: newPreloaded,
        }));

      } catch (error) {
        console.error('Audio preloading failed:', error);
      }
    },

    clearPreloaded: () => {
      const state = get();
      
      // プリロードされた音声要素をクリーンアップ
      Object.values(state.preloaded).forEach(audio => {
        audio.pause();
        audio.src = '';
        audio.load();
      });

      set(_state => ({
        preloaded: {},
      }));
    },

    // ============================================================================
    // ユーティリティアクション
    // ============================================================================

    reset: () => {
      const _state = get();
      
      // 現在の音声を停止
      if (_state.current.audio) {
        _state.current.audio.pause();
      }

      // プリロードされた音声をクリーンアップ
      get().clearPreloaded();

      set({
        current: {
          audio: null,
          url: null,
          word: null,
        },
        playback: {
          isPlaying: false,
          isLoading: false,
          error: null,
          volume: DEFAULT_AUDIO_CONFIG.volume,
          playbackSpeed: DEFAULT_AUDIO_CONFIG.playbackSpeed,
          isMuted: false,
        },
        preloaded: {},
      });
    },

    hydrate: (_state: Record<string, unknown>) => {
      // 永続化からの復元時に使用（音声設定のみ）
      if (_state.playback && typeof _state.playback === 'object') {
        const playback = _state.playback as Record<string, unknown>;
        
        set(prevState => ({
          playback: {
            ...prevState.playback,
            volume: typeof playback.volume === 'number' ? playback.volume : prevState.playback.volume,
            playbackSpeed: typeof playback.playbackSpeed === 'number' ? playback.playbackSpeed : prevState.playback.playbackSpeed,
            isMuted: typeof playback.isMuted === 'boolean' ? playback.isMuted : prevState.playback.isMuted,
          },
        }));
      }
    },
  }))
);

// ============================================================================
// セレクター（パフォーマンス最適化）
// ============================================================================

/** 再生状態の取得 */
export const usePlaybackState = () => 
  useAudioStore(state => ({
    isPlaying: state.playback.isPlaying,
    isLoading: state.playback.isLoading,
    error: state.playback.error,
  }));

/** 音声設定の取得 */
export const useAudioSettings = () => 
  useAudioStore(state => ({
    volume: state.playback.volume,
    playbackSpeed: state.playback.playbackSpeed,
    isMuted: state.playback.isMuted,
  }));

/** 現在の音声情報の取得 */
export const useCurrentAudio = () => 
  useAudioStore(state => ({
    word: state.current.word,
    url: state.current.url,
    isPlaying: state.playback.isPlaying,
  }));

// ============================================================================
// カスタムフック
// ============================================================================

/** 単語の音声再生フック */
export const useWordAudio = (word: Word) => {
  const playWordAudio = useAudioStore(state => state.playWordAudio);
  const currentWord = useAudioStore(state => state.current.word);
  const isPlaying = useAudioStore(state => state.playback.isPlaying);
  
  const isCurrentWord = currentWord?.id === word.id;
  
  return {
    play: () => playWordAudio(word),
    isPlaying: isCurrentWord && isPlaying,
    isCurrentWord,
  };
};
