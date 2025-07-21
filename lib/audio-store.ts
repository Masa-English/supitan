import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  // 音声設定
  isEnabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  
  // 音声インスタンス
  speechSynthesis: SpeechSynthesis | null;
  currentUtterance: SpeechSynthesisUtterance | null;
  selectedVoice: SpeechSynthesisVoice | null;
  
  // アクション
  initialize: () => void;
  speak: (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  
  // 設定変更
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  
  // 音声情報
  getVoices: () => SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // 初期状態
      isEnabled: true,
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
      speechSynthesis: null,
      currentUtterance: null,
      selectedVoice: null,

      // 初期化
      initialize: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const speechSynthesis = window.speechSynthesis;
          set({ speechSynthesis });
          
          // 音声リストが読み込まれるまで待機
          if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
              const voices = speechSynthesis.getVoices();
              // 日本語音声を優先的に選択
              const japaneseVoice = voices.find(voice => 
                voice.lang.includes('ja') || voice.lang.includes('JP')
              );
              const defaultVoice = voices.find(voice => 
                voice.lang.includes('en') || voice.default
              );
              set({ selectedVoice: japaneseVoice || defaultVoice || voices[0] });
            });
          } else {
            const voices = speechSynthesis.getVoices();
            const japaneseVoice = voices.find(voice => 
              voice.lang.includes('ja') || voice.lang.includes('JP')
            );
            const defaultVoice = voices.find(voice => 
              voice.lang.includes('en') || voice.default
            );
            set({ selectedVoice: japaneseVoice || defaultVoice || voices[0] });
          }
        }
      },

      // 音声再生
      speak: (text: string, options = {}) => {
        const { speechSynthesis, selectedVoice, isEnabled, volume, rate, pitch } = get();
        
        if (!isEnabled || !speechSynthesis) return;

        // 現在の音声を停止
        get().stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.volume = options.volume ?? volume;
        utterance.rate = options.rate ?? rate;
        utterance.pitch = options.pitch ?? pitch;
        utterance.lang = selectedVoice?.lang || 'en-US';

        // イベントリスナー
        utterance.onend = () => {
          set({ currentUtterance: null });
        };

        utterance.onerror = (event) => {
          console.error('音声再生エラー:', event);
          set({ currentUtterance: null });
        };

        set({ currentUtterance: utterance });
        speechSynthesis.speak(utterance);
      },

      // 音声停止
      stop: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          speechSynthesis.cancel();
        }
        set({ currentUtterance: null });
      },

      // 音声一時停止
      pause: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          speechSynthesis.pause();
        }
      },

      // 音声再開
      resume: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          speechSynthesis.resume();
        }
      },

      // 設定変更
      setEnabled: (enabled: boolean) => {
        set({ isEnabled: enabled });
        if (!enabled) {
          get().stop();
        }
      },

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) });
      },

      setRate: (rate: number) => {
        set({ rate: Math.max(0.1, Math.min(10, rate)) });
      },

      setPitch: (pitch: number) => {
        set({ pitch: Math.max(0, Math.min(2, pitch)) });
      },

      // 音声情報
      getVoices: () => {
        const { speechSynthesis } = get();
        return speechSynthesis ? speechSynthesis.getVoices() : [];
      },

      setVoice: (voice: SpeechSynthesisVoice) => {
        set({ selectedVoice: voice });
      },
    }),
    {
      name: 'audio-settings',
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        volume: state.volume,
        rate: state.rate,
        pitch: state.pitch,
      }),
    }
  )
); 