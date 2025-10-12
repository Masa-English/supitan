/**
 * 統一されたデータストア
 * 効率的なキャッシュ戦略とエラーハンドリングを備えた最適化されたデータ管理
 */

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DatabaseService } from '@/lib/api/database';
// import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import type { 
  DataStoreState, 
  SearchFilters, 
  AsyncState, 
  CacheState 
} from '@/lib/types/stores-unified';
import type { Word, CategoryWithStats, ReviewWord, UserProgress } from '@/lib/types';

// ============================================================================
// 定数とユーティリティ
// ============================================================================

/** キャッシュの有効期限（ミリ秒） */
const CACHE_DURATION = {
  WORDS: 15 * 60 * 1000,      // 15分（延長）
  CATEGORIES: 60 * 60 * 1000, // 1時間（延長）
  REVIEW: 10 * 60 * 1000,     // 10分（延長）
  USER_PROGRESS: 5 * 60 * 1000, // 5分（ユーザー進捗は短め）
} as const;

/** 初期状態のヘルパー */
const createAsyncState = <T>(data: T | null = null): AsyncState<T> => ({
  data,
  loading: false,
  error: null,
});

const createCacheState = <T>(): CacheState<T> => ({
  data: {},
  lastUpdated: {},
  expiry: CACHE_DURATION.WORDS,
});

/** キャッシュが有効かチェック */
const isCacheValid = (lastUpdated: number, expiry: number): boolean => {
  return Date.now() - lastUpdated < expiry;
};

/** エラーメッセージを正規化 */
const normalizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// ============================================================================
// ストア実装
// ============================================================================

export const useDataStore = create<DataStoreState>()(
  subscribeWithSelector((set, get) => ({
    // ============================================================================
    // 初期状態
    // ============================================================================
    
    words: createAsyncState<Record<string, Word[]>>({}),
    categories: createAsyncState<CategoryWithStats[]>([]),
    reviewWords: createAsyncState<ReviewWord[]>([]),
    userProgress: createAsyncState<UserProgress[]>([]),
    
    search: {
      query: '',
      filters: {
        categories: [],
        favoritesOnly: false,
        masteredOnly: false,
        unstudiedOnly: false,
      },
      results: [],
    },
    
    cache: createCacheState<Word[]>(),

    // ============================================================================
    // データ取得アクション
    // ============================================================================

    fetchWords: async (category: string, forceRefresh = false) => {
      const state = get();
      const { cache } = state;
      
      // キャッシュチェック
      if (
        !forceRefresh &&
        cache.data[category] &&
        isCacheValid(cache.lastUpdated[category] || 0, cache.expiry)
      ) {
        // キャッシュから返す
        set(state => ({
          words: {
            ...state.words,
            data: {
              ...state.words.data,
              [category]: cache.data[category],
            },
          },
        }));
        return;
      }

      // ローディング開始
      set(state => ({
        words: {
          ...state.words,
          loading: true,
          error: null,
        },
      }));

      try {
        const db = new DatabaseService();
        const words = await db.getWordsByCategory(category);
        const now = Date.now();

        set(state => ({
          words: {
            data: {
              ...state.words.data,
              [category]: words,
            },
            loading: false,
            error: null,
          },
          cache: {
            ...state.cache,
            data: {
              ...state.cache.data,
              [category]: words,
            },
            lastUpdated: {
              ...state.cache.lastUpdated,
              [category]: now,
            },
          },
        }));

        // 検索フィルターを再適用
        get().applyFilters();

      } catch (error) {
        const errorMessage = normalizeError(error);
        console.error(`Failed to fetch words for category ${category}:`, error);

        set(state => ({
          words: {
            ...state.words,
            loading: false,
            error: errorMessage,
          },
        }));
      }
    },

    fetchCategories: async (forceRefresh = false) => {
      const state = get();
      const lastUpdated = state.cache.lastUpdated['categories'] || 0;
      
      // キャッシュチェック
      if (
        !forceRefresh &&
        state.categories.data &&
        state.categories.data.length > 0 &&
        isCacheValid(lastUpdated, CACHE_DURATION.CATEGORIES)
      ) {
        return;
      }

      set(state => ({
        categories: {
          ...state.categories,
          loading: true,
          error: null,
        },
      }));

      try {
        const db = new DatabaseService();
        const categories = await db.getCategories();
        const now = Date.now();

        set(state => ({
          categories: {
            data: categories,
            loading: false,
            error: null,
          },
          cache: {
            ...state.cache,
            lastUpdated: {
              ...state.cache.lastUpdated,
              categories: now,
            },
          },
        }));

      } catch (error) {
        const errorMessage = normalizeError(error);
        console.error('Failed to fetch categories:', error);

        set(state => ({
          categories: {
            ...state.categories,
            loading: false,
            error: errorMessage,
          },
        }));
      }
    },

    fetchReviewWords: async (userId: string, forceRefresh = false) => {
      const state = get();
      const cacheKey = `review_${userId}`;
      const lastUpdated = state.cache.lastUpdated[cacheKey] || 0;
      
      // キャッシュチェック
      if (
        !forceRefresh &&
        state.reviewWords.data &&
        state.reviewWords.data.length >= 0 &&
        isCacheValid(lastUpdated, CACHE_DURATION.REVIEW)
      ) {
        return;
      }

      set(state => ({
        reviewWords: {
          ...state.reviewWords,
          loading: true,
          error: null,
        },
      }));

      try {
        const db = new DatabaseService();
        const reviewWords = await db.getDueReviewWords(userId);
        const now = Date.now();

        set(state => ({
          reviewWords: {
            data: reviewWords,
            loading: false,
            error: null,
          },
          cache: {
            ...state.cache,
            lastUpdated: {
              ...state.cache.lastUpdated,
              [cacheKey]: now,
            },
          },
        }));

      } catch (error) {
        const errorMessage = normalizeError(error);
        console.error('Failed to fetch review words:', error);

        set(state => ({
          reviewWords: {
            ...state.reviewWords,
            loading: false,
            error: errorMessage,
          },
        }));
      }
    },

    fetchUserProgress: async (userId: string, forceRefresh = false) => {
      const state = get();
      const cacheKey = `user_progress_${userId}`;
      const lastUpdated = state.cache.lastUpdated[cacheKey] || 0;
      
      // キャッシュチェック
      if (
        !forceRefresh &&
        state.userProgress.data &&
        state.userProgress.data.length >= 0 &&
        isCacheValid(lastUpdated, CACHE_DURATION.USER_PROGRESS)
      ) {
        return;
      }

      set(state => ({
        userProgress: {
          ...state.userProgress,
          loading: true,
          error: null,
        },
      }));

      try {
        const db = new DatabaseService();
        const userProgress = await db.getUserProgress(userId);
        const now = Date.now();

        set(state => ({
          userProgress: {
            data: userProgress,
            loading: false,
            error: null,
          },
          cache: {
            ...state.cache,
            lastUpdated: {
              ...state.cache.lastUpdated,
              [cacheKey]: now,
            },
          },
        }));

      } catch (error) {
        const errorMessage = normalizeError(error);
        console.error('Failed to fetch user progress:', error);

        set(state => ({
          userProgress: {
            ...state.userProgress,
            loading: false,
            error: errorMessage,
          },
        }));
      }
    },

    // ============================================================================
    // データアクセサー
    // ============================================================================

    getWordsByCategory: (category: string): Word[] => {
      const state = get();
      return state.words.data?.[category] || [];
    },

    // ============================================================================
    // 検索・フィルタリング
    // ============================================================================

    searchWords: (query: string) => {
      set(state => ({
        search: {
          ...state.search,
          query,
        },
      }));
      get().applyFilters();
    },

    updateFilters: (filters: Partial<SearchFilters>) => {
      set(state => ({
        search: {
          ...state.search,
          filters: {
            ...state.search.filters,
            ...filters,
          },
        },
      }));
      get().applyFilters();
    },

    applyFilters: async () => {
      const state = get();
      const { search, words, userProgress } = state;
      const { query, filters } = search;
      
      // 全単語を取得
      const allWords: Word[] = [];
      if (words.data) {
        Object.values(words.data).forEach(categoryWords => {
          allWords.push(...categoryWords);
        });
      }

      // フィルタリング適用
      let filteredWords = allWords;

      // テキスト検索
      if (query.trim()) {
        const lowercaseQuery = query.toLowerCase();
        filteredWords = filteredWords.filter(word =>
          word.word.toLowerCase().includes(lowercaseQuery) ||
          word.japanese.toLowerCase().includes(lowercaseQuery) ||
          word.phonetic?.toLowerCase().includes(lowercaseQuery)
        );
      }

      // カテゴリフィルター
      if (filters.categories.length > 0) {
        filteredWords = filteredWords.filter(word =>
          filters.categories.includes(word.category)
        );
      }

      // UserProgressフィルター（お気に入り、習得済み、未学習）
      if (userProgress.data && userProgress.data.length > 0) {
        const progressMap = new Map(userProgress.data.map(p => [p.word_id, p]));

        // お気に入りフィルター
        if (filters.favoritesOnly) {
          filteredWords = filteredWords.filter(word => {
            const progress = progressMap.get(word.id);
            return progress?.is_favorite === true;
          });
        }

        // 習得済みフィルター
        if (filters.masteredOnly) {
          filteredWords = filteredWords.filter(word => {
            const progress = progressMap.get(word.id);
            return progress && (progress.mastery_level || 0) >= 0.8;
          });
        }

        // 未学習フィルター
        if (filters.unstudiedOnly) {
          filteredWords = filteredWords.filter(word => {
            const progress = progressMap.get(word.id);
            return !progress || (progress.study_count || 0) === 0;
          });
        }
      } else {
        // UserProgressデータがない場合のフォールバック
        if (filters.favoritesOnly || filters.masteredOnly) {
          filteredWords = [];
        }
        // 未学習フィルターの場合は全ての単語を未学習として扱う
      }

      set(state => ({
        search: {
          ...state.search,
          results: filteredWords,
        },
      }));
    },

    clearSearch: () => {
      set(_state => ({
        search: {
          query: '',
          filters: {
            categories: [],
            favoritesOnly: false,
            masteredOnly: false,
            unstudiedOnly: false,
          },
          results: [],
        },
      }));
    },

    // ============================================================================
    // キャッシュ管理
    // ============================================================================

    clearCache: () => {
      set(_state => ({
        cache: createCacheState<Word[]>(),
      }));
    },

    refreshData: async () => {
      const state = get();
      const promises: Promise<void>[] = [];

      // カテゴリーを強制更新
      promises.push(get().fetchCategories(true));

      // キャッシュされた全カテゴリーの単語を強制更新（並列実行数を制限）
      if (state.words.data) {
        const categories = Object.keys(state.words.data);
        // 一度に最大3つのカテゴリーを更新
        const batchSize = 3;
        for (let i = 0; i < categories.length; i += batchSize) {
          const batch = categories.slice(i, i + batchSize);
          const batchPromises = batch.map(category => get().fetchWords(category, true));
          await Promise.all(batchPromises);
        }
      }

      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    },

    // ============================================================================
    // ユーティリティアクション
    // ============================================================================

    reset: () => {
      set({
        words: createAsyncState<Record<string, Word[]>>({}),
         categories: createAsyncState<CategoryWithStats[]>([]),
        reviewWords: createAsyncState<ReviewWord[]>([]),
        userProgress: createAsyncState<UserProgress[]>([]),
        search: {
          query: '',
          filters: {
            categories: [],
            favoritesOnly: false,
            masteredOnly: false,
            unstudiedOnly: false,
          },
          results: [],
        },
        cache: createCacheState<Word[]>(),
      });
    },

    hydrate: (_state: Record<string, unknown>) => {
      // 永続化からの復元時に使用
      if (_state.search && typeof _state.search === 'object') {
        set(prevState => ({
          search: {
            ...prevState.search,
            ...(_state.search as Record<string, unknown>),
          },
        }));
      }
    },
  }))
);

// ============================================================================
// セレクター（パフォーマンス最適化）
// ============================================================================

/** 単語データの取得（メモ化） */
export const useWords = (category?: string) => 
  useDataStore(state => {
    if (category) {
      return state.words.data?.[category] || [];
    }
    return state.words.data || {};
  });

/** カテゴリーデータの取得 */
export const useCategories = () => 
  useDataStore(state => state.categories.data || []);

/** 検索結果の取得 */
export const useSearchResults = () => 
  useDataStore(state => state.search.results);

/** ローディング状態の取得 */
export const useDataLoading = () => 
  useDataStore(state => ({
    words: state.words.loading,
    categories: state.categories.loading,
    reviewWords: state.reviewWords.loading,
    userProgress: state.userProgress.loading,
  }));

/** エラー状態の取得 */
export const useDataErrors = () => 
  useDataStore(state => ({
    words: state.words.error,
    categories: state.categories.error,
    reviewWords: state.reviewWords.error,
    userProgress: state.userProgress.error,
  }));

/** ユーザー進捗データの取得 */
export const useUserProgress = () => 
  useDataStore(state => state.userProgress.data || []);
