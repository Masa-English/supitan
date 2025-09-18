/**
 * アプリケーション全体のストアプロバイダー
 * 統一されたストア管理とコンテキストの提供
 */

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useDataStore } from './data-store-unified';
import { useAudioStore } from './audio-store-unified';
import { useUIStore } from './ui-store-unified';

// ============================================================================
// コンテキスト定義
// ============================================================================

interface AppStoreContextValue {
  // ストアアクセサー
  dataStore: typeof useDataStore;
  audioStore: typeof useAudioStore;
  uiStore: typeof useUIStore;
  
  // 統合アクション
  resetAllStores: () => void;
  initializeStores: (userId?: string) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

// ============================================================================
// プロバイダーコンポーネント
// ============================================================================

interface AppStoreProviderProps {
  children: React.ReactNode;
  initialUserId?: string;
}

export function AppStoreProvider({ children, initialUserId }: AppStoreProviderProps) {
  // ストアの初期化
  useEffect(() => {
    if (initialUserId) {
      initializeStores(initialUserId);
    }
  }, [initialUserId]);

  // 統合アクション
  const resetAllStores = () => {
    useDataStore.getState().reset();
    useAudioStore.getState().reset();
    useUIStore.getState().reset();
  };

  const initializeStores = async (userId?: string) => {
    try {
      // データストアの初期化
      await useDataStore.getState().fetchCategories();
      
      if (userId) {
        await useDataStore.getState().fetchReviewWords(userId);
      }
      
      // UIテーマの初期化
      const theme = useUIStore.getState().theme;
      useUIStore.getState().setTheme(theme);
      
    } catch (error) {
      console.error('Failed to initialize stores:', error);
      useUIStore.getState().addToast({
        type: 'error',
        message: 'アプリケーションの初期化に失敗しました',
      });
    }
  };

  const contextValue: AppStoreContextValue = {
    dataStore: useDataStore,
    audioStore: useAudioStore,
    uiStore: useUIStore,
    resetAllStores,
    initializeStores,
  };

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
}

// ============================================================================
// カスタムフック
// ============================================================================

/**
 * アプリストアコンテキストの使用
 */
export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}

/**
 * 統合されたアプリケーション状態の取得
 */
export function useAppState() {
  const dataStore = useDataStore();
  const audioStore = useAudioStore();
  const uiStore = useUIStore();
  
  return {
    // データ状態
    words: dataStore.words.data || {},
    categories: dataStore.categories.data || [],
    searchResults: dataStore.search.results,
    
    // オーディオ状態
    isPlaying: audioStore.playback.isPlaying,
    currentWord: audioStore.current.word,
    volume: audioStore.playback.volume,
    isMuted: audioStore.playback.isMuted,
    
    // UI状態
    theme: uiStore.theme,
    sidebarOpen: uiStore.sidebar.isOpen,
    globalLoading: uiStore.loading.global,
    toasts: uiStore.toasts,
    
    // ローディング状態
    loading: {
      words: dataStore.words.loading,
      categories: dataStore.categories.loading,
      audio: audioStore.playback.isLoading,
      global: uiStore.loading.global,
    },
    
    // エラー状態
    errors: {
      words: dataStore.words.error,
      categories: dataStore.categories.error,
      audio: audioStore.playback.error,
    },
  };
}

/**
 * 統合されたアクション
 */
export function useAppActions() {
  const { resetAllStores, initializeStores } = useAppStore();
  
  // データアクション
  const fetchWords = useDataStore(state => state.fetchWords);
  const fetchCategories = useDataStore(state => state.fetchCategories);
  const searchWords = useDataStore(state => state.searchWords);
  const clearSearch = useDataStore(state => state.clearSearch);
  
  // オーディオアクション
  const playWordAudio = useAudioStore(state => state.playWordAudio);
  const setVolume = useAudioStore(state => state.setVolume);
  const toggleMute = useAudioStore(state => state.toggleMute);
  
  // UIアクション
  const setTheme = useUIStore(state => state.setTheme);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const addToast = useUIStore(state => state.addToast);
  const setGlobalLoading = useUIStore(state => state.setGlobalLoading);
  
  return {
    // システムアクション
    resetAllStores,
    initializeStores,
    
    // データアクション
    fetchWords,
    fetchCategories,
    searchWords,
    clearSearch,
    
    // オーディオアクション
    playWordAudio,
    setVolume,
    toggleMute,
    
    // UIアクション
    setTheme,
    toggleSidebar,
    addToast,
    setGlobalLoading,
    
    // 便利メソッド
    showSuccessToast: (message: string) => addToast({ type: 'success', message }),
    showErrorToast: (message: string) => addToast({ type: 'error', message }),
    showWarningToast: (message: string) => addToast({ type: 'warning', message }),
    showInfoToast: (message: string) => addToast({ type: 'info', message }),
  };
}

// ============================================================================
// ストア同期フック
// ============================================================================

/**
 * ストア間の同期処理
 */
export function useStoreSync() {
  const dataStore = useDataStore();
  const audioStore = useAudioStore();
  const uiStore = useUIStore();
  
  // データローディング状態をUIに反映
  useEffect(() => {
    const isLoading = dataStore.words.loading || dataStore.categories.loading;
    uiStore.setGlobalLoading(isLoading);
  }, [dataStore.words.loading, dataStore.categories.loading, uiStore]);
  
  // エラー状態をトーストに表示
  useEffect(() => {
    if (dataStore.words.error) {
      uiStore.addToast({
        type: 'error',
        message: `単語データの取得に失敗: ${dataStore.words.error}`,
      });
    }
  }, [dataStore.words.error, uiStore]);
  
  useEffect(() => {
    if (dataStore.categories.error) {
      uiStore.addToast({
        type: 'error',
        message: `カテゴリーデータの取得に失敗: ${dataStore.categories.error}`,
      });
    }
  }, [dataStore.categories.error, uiStore]);
  
  useEffect(() => {
    if (audioStore.playback.error) {
      uiStore.addToast({
        type: 'error',
        message: `音声再生エラー: ${audioStore.playback.error}`,
      });
    }
  }, [audioStore.playback.error, uiStore]);
}

// ============================================================================
// デバッグ用フック
// ============================================================================

/**
 * ストア状態のデバッグ情報
 */
export function useStoreDebug() {
  const dataStore = useDataStore();
  const audioStore = useAudioStore();
  const uiStore = useUIStore();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return {
    data: {
      wordsCount: Object.values(dataStore.words.data || {}).flat().length,
      categoriesCount: dataStore.categories.data?.length || 0,
      searchResultsCount: dataStore.search.results.length,
      cacheSize: Object.keys(dataStore.cache.data).length,
    },
    audio: {
      isPlaying: audioStore.playback.isPlaying,
      currentWord: audioStore.current.word?.word,
      preloadedCount: Object.keys(audioStore.preloaded).length,
    },
    ui: {
      theme: uiStore.theme,
      modalsOpen: Object.values(uiStore.modals).filter(Boolean).length,
      toastsCount: uiStore.toasts.length,
      loadingStates: Object.keys(uiStore.loading.states).length,
    },
  };
}
