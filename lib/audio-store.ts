import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface AudioState {
  isMuted: boolean;
  volume: number;
  correctAudio: HTMLAudioElement | null;
  incorrectAudio: HTMLAudioElement | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  initializeAudio: () => Promise<void>;
  playCorrectSound: () => void;
  playIncorrectSound: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  cleanup: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isMuted: false,
  volume: 0.7,
  correctAudio: null,
  incorrectAudio: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  initializeAudio: async () => {
    const { isInitialized } = get();
    
    // 既に初期化済みの場合は何もしない
    if (isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const supabase = createClient();
      
      // Supabase Storageから音声ファイルを取得
      const { data: correctData, error: correctError } = await supabase.storage
        .from('se')
        .download('collect.mp3');
      
      const { data: incorrectData, error: incorrectError } = await supabase.storage
        .from('se')
        .download('error.mp3');

      // 音声ファイルの取得に失敗した場合のフォールバック処理
      if (correctError || incorrectError) {
        console.warn('音声ファイルの取得に失敗しました。Web Speech APIを使用します。', {
          correctError,
          incorrectError
        });
        
        // エラーを設定するが、アプリケーションは継続動作
        set({
          isLoading: false,
          error: '音声ファイルの取得に失敗しました。Web Speech APIを使用します。',
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
      correctAudio.preload = 'auto';
      incorrectAudio.preload = 'auto';

      set({
        correctAudio,
        incorrectAudio,
        isLoading: false,
        error: null,
        isInitialized: true
      });

    } catch (error) {
      console.error('音声初期化エラー:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '音声の初期化に失敗しました',
        isInitialized: true
      });
    }
  },

  playCorrectSound: () => {
    const { correctAudio, isMuted, volume, error, isInitialized } = get();
    
    // 初期化されていない場合は初期化を試行
    if (!isInitialized) {
      get().initializeAudio();
      return;
    }
    
    // 音声ファイルが利用できない場合はWeb Speech APIを使用
    if (!correctAudio && !error) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Correct!');
        utterance.lang = 'en-US';
        utterance.volume = volume;
        speechSynthesis.speak(utterance);
      }
      return;
    }
    
    if (correctAudio && !isMuted) {
      correctAudio.volume = volume;
      correctAudio.currentTime = 0;
      correctAudio.play().catch(error => {
        console.error('正解音再生エラー:', error);
      });
    }
  },

  playIncorrectSound: () => {
    const { incorrectAudio, isMuted, volume, error, isInitialized } = get();
    
    // 初期化されていない場合は初期化を試行
    if (!isInitialized) {
      get().initializeAudio();
      return;
    }
    
    // 音声ファイルが利用できない場合はWeb Speech APIを使用
    if (!incorrectAudio && !error) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Incorrect');
        utterance.lang = 'en-US';
        utterance.volume = volume;
        speechSynthesis.speak(utterance);
      }
      return;
    }
    
    if (incorrectAudio && !isMuted) {
      incorrectAudio.volume = volume;
      incorrectAudio.currentTime = 0;
      incorrectAudio.play().catch(error => {
        console.error('不正解音再生エラー:', error);
      });
    }
  },

  toggleMute: () => {
    set(state => ({ isMuted: !state.isMuted }));
  },

  setVolume: (volume: number) => {
    const { correctAudio, incorrectAudio } = get();
    set({ volume });
    
    if (correctAudio) {
      correctAudio.volume = volume;
    }
    if (incorrectAudio) {
      incorrectAudio.volume = volume;
    }
  },

  cleanup: () => {
    const { correctAudio, incorrectAudio } = get();
    
    // Audioオブジェクトのクリーンアップ
    if (correctAudio) {
      correctAudio.pause();
      correctAudio.src = '';
    }
    if (incorrectAudio) {
      incorrectAudio.pause();
      incorrectAudio.src = '';
    }
    
    // URLオブジェクトの解放
    if (correctAudio?.src) {
      URL.revokeObjectURL(correctAudio.src);
    }
    if (incorrectAudio?.src) {
      URL.revokeObjectURL(incorrectAudio.src);
    }
    
    set({
      correctAudio: null,
      incorrectAudio: null,
      isInitialized: false,
      isLoading: false,
      error: null
    });
  }
})); 