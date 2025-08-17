'use client';

import { useEffect } from 'react';
import { useUserStore } from './user-store';
import { useDataStore } from './data-store';
import { useSettingsStore } from './settings-store';
import { useAudioStore } from './audio-store';
import { useUIStore } from './ui-store';
import { useLearningSessionStore } from './navigation-store';

// アプリケーション初期化フック
export function useAppInitialization() {
  const { initialize: initializeUser } = useUserStore();
  const { loadWords, loadCategories } = useDataStore();
  const { initializeAudio } = useAudioStore();
  const { setLoading } = useUIStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading('global', true);
        
        // 並行して初期化を実行
        await Promise.all([
          initializeUser(),
          loadWords(),
          loadCategories(),
          initializeAudio(),
        ]);
        
        setLoading('global', false);
      } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        setLoading('global', false);
      }
    };

    initializeApp();
  }, [initializeUser, loadWords, loadCategories, initializeAudio, setLoading]);
}

// ユーザー認証状態フック
export function useAuth() {
  const { user, loading, error, initialize, signOut } = useUserStore();
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    initialize,
    signOut,
  };
}

// 学習データフック
export function useLearningData(category?: string) {
  const { words, categories, reviewWords, wordsLoading, categoriesLoading, reviewWordsLoading, getWordsByCategory, loadReviewWords } = useDataStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user && !reviewWords.length) {
      loadReviewWords(user.id);
    }
  }, [user, reviewWords.length, loadReviewWords]);

  const getCategoryWords = async () => {
    if (!category) return [];
    return await getWordsByCategory(category);
  };

  return {
    words,
    categories,
    reviewWords,
    loading: wordsLoading || categoriesLoading || reviewWordsLoading,
    getCategoryWords,
  };
}

// 検索・フィルタリングフック
export function useSearch() {
  const { 
    searchQuery, 
    searchFilters, 
    filteredWords, 
    searchWords, 
    updateFilters, 
    clearFilters 
  } = useDataStore();

  return {
    searchQuery,
    searchFilters,
    filteredWords,
    searchWords,
    updateFilters,
    clearFilters,
  };
}

// 設定フック
export function useAppSettings() {
  const settings = useSettingsStore();
  
  return {
    ...settings,
    // 便利なヘルパー関数
    isDarkMode: settings.theme === 'dark' || 
      (settings.theme === 'system' && typeof window !== 'undefined' && 
       window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLargeFont: settings.accessibility.fontSize === 'large',
    isHighContrast: settings.accessibility.highContrast,
    isReducedMotion: settings.accessibility.reduceMotion,
  };
}

// 音声制御フック
export function useAudio() {
  const audio = useAudioStore();
  const settings = useSettingsStore();
  
  // 設定と連携
  useEffect(() => {
    if (settings.audio.volume !== audio.volume) {
      audio.setVolume(settings.audio.volume);
    }
  }, [settings.audio.volume, audio]);

  return {
    ...audio,
    // 設定に基づく音声再生
    playWithSettings: (wordId: string) => {
      if (settings.audio.enabled) {
        audio.playWordAudio(wordId);
      }
    },
    playCorrectWithSettings: () => {
      if (settings.audio.enabled) {
        audio.playCorrectSound();
      }
    },
    playIncorrectWithSettings: () => {
      if (settings.audio.enabled) {
        audio.playIncorrectSound();
      }
    },
  };
}

// UI制御フック
export function useAppUI() {
  const ui = useUIStore();
  
  return {
    ...ui,
    // 便利なヘルパー関数
    showSuccessNotification: (message: string, title = '成功') => {
      ui.addNotification({
        type: 'success',
        title,
        message,
      });
    },
    showErrorNotification: (message: string, title = 'エラー') => {
      ui.addNotification({
        type: 'error',
        title,
        message,
      });
    },
    showWarningNotification: (message: string, title = '警告') => {
      ui.addNotification({
        type: 'warning',
        title,
        message,
      });
    },
    showInfoNotification: (message: string, title = '情報') => {
      ui.addNotification({
        type: 'info',
        title,
        message,
      });
    },
  };
}

// 学習セッション管理フック
export function useLearningSession() {
  const { 
    category, 
    currentSection, 
    sections, 
    learningMode, 
    setLearningSession, 
    getNextSection, 
    hasNextSection, 
    clearSession, 
    updateCurrentSection 
  } = useLearningSessionStore();

  return {
    category,
    currentSection,
    sections,
    learningMode,
    hasNextSection,
    setLearningSession,
    getNextSection,
    clearSession,
    updateCurrentSection,
    // 便利なヘルパー関数
    isInSession: !!category && !!currentSection,
    getSessionInfo: () => ({
      category,
      currentSection,
      totalSections: sections.length,
      currentIndex: sections.indexOf(currentSection || '') + 1,
      progress: sections.length > 0 ? (sections.indexOf(currentSection || '') + 1) / sections.length : 0,
    }),
  };
}
