import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface AudioState {
  isMuted: boolean;
  volume: number;
  correctAudio: HTMLAudioElement | null;
  incorrectAudio: HTMLAudioElement | null;
  isLoading: boolean;
  error: string | null;
  initializeAudio: () => Promise<void>;
  playCorrectSound: () => void;
  playIncorrectSound: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isMuted: false,
  volume: 0.7,
  correctAudio: null,
  incorrectAudio: null,
  isLoading: false,
  error: null,

  initializeAudio: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const supabase = createClient();
      
      // Supabase Storageから音声ファイルを取得
      const { data: correctData, error: correctError } = await supabase.storage
        .from('se')
        .download('correct.mp3');
      
      const { data: incorrectData, error: incorrectError } = await supabase.storage
        .from('se')
        .download('error.mp3');

      if (correctError || incorrectError) {
        throw new Error('音声ファイルの取得に失敗しました');
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
        error: null
      });

    } catch (error) {
      console.error('音声初期化エラー:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '音声の初期化に失敗しました'
      });
    }
  },

  playCorrectSound: () => {
    const { correctAudio, isMuted, volume } = get();
    if (correctAudio && !isMuted) {
      correctAudio.volume = volume;
      correctAudio.currentTime = 0;
      correctAudio.play().catch(error => {
        console.error('正解音再生エラー:', error);
      });
    }
  },

  playIncorrectSound: () => {
    const { incorrectAudio, isMuted, volume } = get();
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
  }
})); 