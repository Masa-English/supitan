/**
 * 統一されたストアのエクスポート
 * リファクタリングされたストアシステムの統一エントリーポイント
 */

// ============================================================================
// 型定義
// ============================================================================

export * from '@/lib/types/stores-unified';

// ============================================================================
// 統一されたストア
// ============================================================================

export { 
  useDataStore,
  useWords,
  useCategories,
  useSearchResults,
  useDataLoading,
  useDataErrors,
} from './data-store-unified';

export { 
  useAudioStore,
  usePlaybackState,
  useAudioSettings,
  useCurrentAudio,
  useWordAudio,
} from './audio-store-unified';

export { 
  useUIStore,
  useTheme,
  useModal,
  useSidebar,
  useLoading,
  useToasts,
} from './ui-store-unified';

// ============================================================================
// ストアプロバイダー
// ============================================================================

export {
  AppStoreProvider,
  useAppStore,
  useAppState,
  useAppActions,
  useStoreSync,
  useStoreDebug,
} from './app-store-provider';

// ============================================================================
// 最適化されたフック
// ============================================================================

export {
  useOptimizedData,
  useWordsByCategory,
  useLearningStats,
} from '@/lib/hooks/use-optimized-data';

// ============================================================================
// データプロバイダー
// ============================================================================

export {
  UnifiedDataProvider,
  getDataProvider,
  getWordsWithProgress,
} from '@/lib/api/services/unified-data-provider';

// ============================================================================
// パフォーマンス最適化
// ============================================================================

export {
  createLazyComponent,
  createConditionalLazyComponent,
  useStableCallback,
  useDebouncedCallback,
  usePrevious,
  useChanged,
  useDeepMemo,
  useVirtualScroll,
  useIntersectionObserver,
  LazyLoadComponent,
  conditionalImport,
  createLazyFunction,
  useThrottledCallback,
  arrayUtils,
} from '@/lib/utils/performance-optimized';

// ============================================================================
// レガシーサポート（段階的移行用）
// ============================================================================

/**
 * レガシーストアから統一ストアへの移行ヘルパー
 * 使用例: import { legacyStoreAdapter } from '@/lib/stores';
 */
export const legacyStoreAdapter = {
  /**
   * 古いdata-storeの使用箇所を新しいストアに移行
   */
  migrateDataStore: () => {
    console.warn(
      'Legacy data-store detected. Please migrate to unified stores. ' +
      'See lib/stores/index-unified.ts for migration guide.'
    );
    
    // TODO: 実装が完了したら有効化
    return {};
  },
  
  /**
   * 古いaudio-storeの使用箇所を新しいストアに移行
   */
  migrateAudioStore: () => {
    console.warn(
      'Legacy audio-store detected. Please migrate to unified stores. ' +
      'See lib/stores/index-unified.ts for migration guide.'
    );
    
    // TODO: 実装が完了したら有効化
    return {};
  },
};

// ============================================================================
// 開発者ツール
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // デバッグ用のグローバル関数
  (globalThis as Record<string, unknown>).__DEBUG_STORES__ = {
    // TODO: 実装が完了したらストア参照を追加
    
    // デバッグヘルパー
    getStoreState: () => ({
      message: 'Debug tools available after store implementation completion',
    }),
    
    resetAllStores: () => {
      console.log('All stores reset (placeholder)');
    },
    
    logStoreActions: (enable: boolean = true) => {
      // ストアアクションのログ出力を有効/無効にする
      console.log(`Store action logging ${enable ? 'enabled' : 'disabled'} (placeholder)`);
    },
  };
  
  console.log('🏪 Unified store system loaded. Debug tools available at __DEBUG_STORES__');
}

// ============================================================================
// 移行ガイド（コメント）
// ============================================================================

/**
 * 移行ガイド
 * 
 * 1. レガシーストアから統一ストアへの移行:
 * 
 * Before:
 * ```tsx
 * import { useDataStore } from '@/lib/stores/data-store';
 * import { useAudioStore } from '@/lib/stores/audio-store';
 * 
 * const { words, loading } = useDataStore();
 * const { playAudio } = useAudioStore();
 * ```
 * 
 * After:
 * ```tsx
 * import { useWords, useDataLoading, useWordAudio } from '@/lib/stores';
 * 
 * const words = useWords();
 * const { words: wordsLoading } = useDataLoading();
 * const { play } = useWordAudio(word);
 * ```
 * 
 * 2. アプリケーション全体でのストア使用:
 * 
 * ```tsx
 * import { AppStoreProvider, useAppState, useAppActions } from '@/lib/stores';
 * 
 * function App() {
 *   return (
 *     <AppStoreProvider initialUserId={userId}>
 *       <MainContent />
 *     </AppStoreProvider>
 *   );
 * }
 * 
 * function MainContent() {
 *   const { words, loading } = useAppState();
 *   const { fetchWords, showSuccessToast } = useAppActions();
 * }
 * ```
 * 
 * 3. パフォーマンス最適化:
 * 
 * ```tsx
 * import { createLazyComponent, useVirtualScroll } from '@/lib/stores';
 * 
 * const LazyWordList = createLazyComponent(
 *   () => import('./WordList'),
 *   LoadingSpinner
 * );
 * 
 * function VirtualizedList({ words }) {
 *   const { visibleItems, handleScroll } = useVirtualScroll(words, {
 *     itemHeight: 60,
 *     containerHeight: 400,
 *   });
 * }
 * ```
 */
