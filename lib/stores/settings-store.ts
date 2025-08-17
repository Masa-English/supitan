'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // テーマ設定
  theme: 'light' | 'dark' | 'system';
  
  // 音声設定
  audio: {
    enabled: boolean;
    volume: number;
    autoPlay: boolean;
    speechRate: number;
    speechPitch: number;
  };
  
  // 学習設定
  learning: {
    autoAdvance: boolean;
    showHints: boolean;
    reviewInterval: number; // 日数
    masteryThreshold: number; // 0.0-1.0
    dailyGoal: number; // 単語数
    sessionLength: number; // 分
  };
  
  // アクセシビリティ設定
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  
  // 通知設定
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reviewReminder: boolean;
    achievementNotification: boolean;
    reminderTime: string; // HH:MM
  };
  
  // データ設定
  data: {
    autoSync: boolean;
    offlineMode: boolean;
    cacheSize: number; // MB
    clearCacheOnLogout: boolean;
  };
  
  // アクション
  setTheme: (theme: SettingsState['theme']) => void;
  updateAudioSettings: (settings: Partial<SettingsState['audio']>) => void;
  updateLearningSettings: (settings: Partial<SettingsState['learning']>) => void;
  updateAccessibilitySettings: (settings: Partial<SettingsState['accessibility']>) => void;
  updateNotificationSettings: (settings: Partial<SettingsState['notifications']>) => void;
  updateDataSettings: (settings: Partial<SettingsState['data']>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: Omit<SettingsState, 'setTheme' | 'updateAudioSettings' | 'updateLearningSettings' | 'updateAccessibilitySettings' | 'updateNotificationSettings' | 'updateDataSettings' | 'resetToDefaults' | 'exportSettings' | 'importSettings'> = {
  theme: 'system',
  audio: {
    enabled: true,
    volume: 0.7,
    autoPlay: false,
    speechRate: 0.9,
    speechPitch: 1.0,
  },
  learning: {
    autoAdvance: false,
    showHints: true,
    reviewInterval: 1,
    masteryThreshold: 0.8,
    dailyGoal: 20,
    sessionLength: 15,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
  notifications: {
    enabled: true,
    dailyReminder: true,
    reviewReminder: true,
    achievementNotification: true,
    reminderTime: '09:00',
  },
  data: {
    autoSync: true,
    offlineMode: false,
    cacheSize: 100,
    clearCacheOnLogout: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setTheme: (theme) => {
        set({ theme });
        // テーマ変更時の追加処理
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      updateAudioSettings: (settings) => {
        set(state => ({
          audio: { ...state.audio, ...settings }
        }));
      },

      updateLearningSettings: (settings) => {
        set(state => ({
          learning: { ...state.learning, ...settings }
        }));
      },

      updateAccessibilitySettings: (settings) => {
        set(state => ({
          accessibility: { ...state.accessibility, ...settings }
        }));
        
        // アクセシビリティ設定の即座適用
        const { accessibility } = get();
        if (typeof window !== 'undefined') {
          // フォントサイズの適用
          document.documentElement.setAttribute('data-font-size', accessibility.fontSize);
          
          // 高コントラストの適用
          document.documentElement.setAttribute('data-high-contrast', accessibility.highContrast.toString());
          
          // モーション削減の適用
          document.documentElement.setAttribute('data-reduce-motion', accessibility.reduceMotion.toString());
        }
      },

      updateNotificationSettings: (settings) => {
        set(state => ({
          notifications: { ...state.notifications, ...settings }
        }));
      },

      updateDataSettings: (settings) => {
        set(state => ({
          data: { ...state.data, ...settings }
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },

      exportSettings: () => {
        const settings = get();
        const exportData = {
          theme: settings.theme,
          audio: settings.audio,
          learning: settings.learning,
          accessibility: settings.accessibility,
          notifications: settings.notifications,
          data: settings.data,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: (settingsJson: string) => {
        try {
          const importData = JSON.parse(settingsJson);
          
          // 必要なプロパティが存在するかチェック
          const requiredProps = ['theme', 'audio', 'learning', 'accessibility', 'notifications', 'data'];
          const hasAllProps = requiredProps.every(prop => prop in importData);
          
          if (!hasAllProps) {
            console.error('設定ファイルの形式が正しくありません');
            return false;
          }
          
          set({
            theme: importData.theme,
            audio: { ...defaultSettings.audio, ...importData.audio },
            learning: { ...defaultSettings.learning, ...importData.learning },
            accessibility: { ...defaultSettings.accessibility, ...importData.accessibility },
            notifications: { ...defaultSettings.notifications, ...importData.notifications },
            data: { ...defaultSettings.data, ...importData.data },
          });
          
          return true;
        } catch (error) {
          console.error('設定のインポートに失敗しました:', error);
          return false;
        }
      },
    }),
    {
      name: 'spitan-settings',
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        audio: state.audio,
        learning: state.learning,
        accessibility: state.accessibility,
        notifications: state.notifications,
        data: state.data,
      }),
    }
  )
);
