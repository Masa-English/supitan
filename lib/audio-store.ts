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
  isInitialized: boolean;
  
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
      isInitialized: false,

      // 初期化
      initialize: () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const speechSynthesis = window.speechSynthesis;
          set({ speechSynthesis });
          
          const setupVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              // 日本語音声を優先的に選択
              const japaneseVoice = voices.find(voice => 
                voice.lang.includes('ja') || voice.lang.includes('JP')
              );
              const englishVoice = voices.find(voice => 
                voice.lang.includes('en') || voice.default
              );
              const selectedVoice = japaneseVoice || englishVoice || voices[0];
              
              set({ 
                selectedVoice,
                isInitialized: true 
              });
            }
          };

          // 音声リストが既に利用可能な場合
          if (speechSynthesis.getVoices().length > 0) {
            setupVoices();
          } else {
            // 音声リストが読み込まれるまで待機
            const handleVoicesChanged = () => {
              setupVoices();
              speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            };
            speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
          }
        } else {
          console.warn('Speech Synthesis API is not supported in this browser');
          set({ isEnabled: false });
        }
      },

      // 音声再生
      speak: (text: string, options = {}) => {
        const { speechSynthesis, selectedVoice, isEnabled, volume, rate, pitch, isInitialized } = get();
        
        if (!isEnabled || !speechSynthesis || !isInitialized) {
          console.warn('Audio is disabled or not initialized');
          return;
        }

        try {
          // 現在の音声を停止
          get().stop();

          const utterance = new SpeechSynthesisUtterance(text);
          
          // 音声設定
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
          
          utterance.volume = Math.max(0, Math.min(1, options.volume ?? volume));
          utterance.rate = Math.max(0.1, Math.min(10, options.rate ?? rate));
          utterance.pitch = Math.max(0, Math.min(2, options.pitch ?? pitch));

          // イベントリスナー
          utterance.onstart = () => {
            console.log('Speech started');
          };

          utterance.onend = () => {
            console.log('Speech ended');
            set({ currentUtterance: null });
          };

          utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            set({ currentUtterance: null });
          };

          set({ currentUtterance: utterance });
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Failed to speak:', error);
          set({ currentUtterance: null });
        }
      },

      // 音声停止
      stop: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          try {
            speechSynthesis.cancel();
          } catch (error) {
            console.error('Failed to stop speech:', error);
          }
        }
        set({ currentUtterance: null });
      },

      // 音声一時停止
      pause: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          try {
            speechSynthesis.pause();
          } catch (error) {
            console.error('Failed to pause speech:', error);
          }
        }
      },

      // 音声再開
      resume: () => {
        const { speechSynthesis } = get();
        if (speechSynthesis) {
          try {
            speechSynthesis.resume();
          } catch (error) {
            console.error('Failed to resume speech:', error);
          }
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