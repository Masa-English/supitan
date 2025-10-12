/**
 * 統一データフック
 * 重複したAPI呼び出しを防ぎ、効率的なデータ管理を提供
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataStore } from '@/lib/stores/data-store-unified';
import { DatabaseService } from '@/lib/api/database';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import type { Word, CategoryWithStats, UserProgress, ReviewWord } from '@/lib/types';

interface UseUnifiedDataOptions {
  /** カテゴリー（指定された場合のみそのカテゴリーのデータを取得） */
  category?: string;
  /** ユーザーID（進捗データ取得に必要） */
  userId?: string;
  /** 事前取得されたデータ */
  prefetchedData?: {
    words?: Word[];
    categories?: CategoryWithStats[];
    userProgress?: UserProgress[];
    reviewWords?: ReviewWord[];
  };
  /** 自動更新を有効にするか */
  enableRealtime?: boolean;
  /** 更新間隔（ミリ秒） */
  updateInterval?: number;
}

interface UseUnifiedDataReturn {
  /** 単語データ */
  words: Word[];
  /** カテゴリーデータ */
  categories: CategoryWithStats[];
  /** ユーザー進捗データ */
  userProgress: UserProgress[];
  /** 復習単語データ */
  reviewWords: ReviewWord[];
  /** ローディング状態 */
  loading: {
    words: boolean;
    categories: boolean;
    userProgress: boolean;
    reviewWords: boolean;
  };
  /** エラー状態 */
  error: {
    words: string | null;
    categories: string | null;
    userProgress: string | null;
    reviewWords: string | null;
  };
  /** データ更新関数 */
  refresh: {
    words: () => Promise<void>;
    categories: () => Promise<void>;
    userProgress: () => Promise<void>;
    reviewWords: () => Promise<void>;
    all: () => Promise<void>;
  };
  /** キャッシュ状態 */
  cacheInfo: {
    wordsCached: boolean;
    categoriesCached: boolean;
    userProgressCached: boolean;
    reviewWordsCached: boolean;
  };
}

export function useUnifiedData(options: UseUnifiedDataOptions = {}): UseUnifiedDataReturn {
  const {
    category,
    userId,
    prefetchedData,
    enableRealtime = false,
    updateInterval = 300000, // 5分
  } = options;

  const _supabase = createBrowserClient();
  const _db = useMemo(() => new DatabaseService(), []);

  // グローバルストアからデータを取得
  const {
    words: storeWords,
    categories: storeCategories,
    userProgress: storeUserProgress,
    reviewWords: storeReviewWords,
    fetchWords,
    fetchCategories,
    fetchUserProgress,
    fetchReviewWords,
    getWordsByCategory,
  } = useDataStore();

  // ローカル状態
  const [localWords, setLocalWords] = useState<Word[]>(prefetchedData?.words || []);
  const [localCategories, setLocalCategories] = useState<CategoryWithStats[]>(prefetchedData?.categories || []);
  const [localUserProgress, setLocalUserProgress] = useState<UserProgress[]>(prefetchedData?.userProgress || []);
  const [localReviewWords, setLocalReviewWords] = useState<ReviewWord[]>(prefetchedData?.reviewWords || []);

  // ローディング状態
  const [loading, setLoading] = useState({
    words: false,
    categories: false,
    userProgress: false,
    reviewWords: false,
  });

  // エラー状態
  const [error, setError] = useState({
    words: null as string | null,
    categories: null as string | null,
    userProgress: null as string | null,
    reviewWords: null as string | null,
  });

  // キャッシュ状態のチェック
  const cacheInfo = useMemo(() => {
    // const now = Date.now();
    // const cacheExpiry = 10 * 60 * 1000; // 10分

    return {
      wordsCached: localWords.length > 0 && !loading.words,
      categoriesCached: localCategories.length > 0 && !loading.categories,
      userProgressCached: localUserProgress.length >= 0 && !loading.userProgress,
      reviewWordsCached: localReviewWords.length >= 0 && !loading.reviewWords,
    };
  }, [localWords, localCategories, localUserProgress, localReviewWords, loading]);

  // 単語データの取得
  const fetchWordsData = useCallback(async (forceRefresh = false) => {
    if (!category) return;

    // 事前取得データがある場合はスキップ
    if (prefetchedData?.words && localWords.length > 0 && !forceRefresh) {
      return;
    }

    setLoading(prev => ({ ...prev, words: true }));
    setError(prev => ({ ...prev, words: null }));

    try {
      // ストアから取得を試行
      const storeData = getWordsByCategory(category);
      if (storeData.length > 0 && !forceRefresh) {
        setLocalWords(storeData);
        setLoading(prev => ({ ...prev, words: false }));
        return;
      }

      // ストアにデータがない場合は直接取得
      await fetchWords(category, forceRefresh);
      const updatedData = getWordsByCategory(category);
      setLocalWords(updatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '単語データの取得に失敗しました';
      setError(prev => ({ ...prev, words: errorMessage }));
      console.error('Failed to fetch words:', err);
    } finally {
      setLoading(prev => ({ ...prev, words: false }));
    }
  }, [category, prefetchedData, localWords.length, getWordsByCategory, fetchWords]);

  // カテゴリーデータの取得
  const fetchCategoriesData = useCallback(async (forceRefresh = false) => {
    // 事前取得データがある場合はスキップ
    if (prefetchedData?.categories && localCategories.length > 0 && !forceRefresh) {
      return;
    }

    setLoading(prev => ({ ...prev, categories: true }));
    setError(prev => ({ ...prev, categories: null }));

    try {
      await fetchCategories(forceRefresh);
      setLocalCategories(storeCategories.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'カテゴリーデータの取得に失敗しました';
      setError(prev => ({ ...prev, categories: errorMessage }));
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, [prefetchedData, localCategories.length, fetchCategories, storeCategories]);

  // ユーザー進捗データの取得
  const fetchUserProgressData = useCallback(async (forceRefresh = false) => {
    if (!userId) return;

    // 事前取得データがある場合はスキップ
    if (prefetchedData?.userProgress && localUserProgress.length >= 0 && !forceRefresh) {
      return;
    }

    setLoading(prev => ({ ...prev, userProgress: true }));
    setError(prev => ({ ...prev, userProgress: null }));

    try {
      await fetchUserProgress(userId, forceRefresh);
      setLocalUserProgress(storeUserProgress.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザー進捗データの取得に失敗しました';
      setError(prev => ({ ...prev, userProgress: errorMessage }));
      console.error('Failed to fetch user progress:', err);
    } finally {
      setLoading(prev => ({ ...prev, userProgress: false }));
    }
  }, [userId, prefetchedData, localUserProgress.length, fetchUserProgress, storeUserProgress]);

  // 復習単語データの取得
  const fetchReviewWordsData = useCallback(async (forceRefresh = false) => {
    if (!userId) return;

    // 事前取得データがある場合はスキップ
    if (prefetchedData?.reviewWords && localReviewWords.length >= 0 && !forceRefresh) {
      return;
    }

    setLoading(prev => ({ ...prev, reviewWords: true }));
    setError(prev => ({ ...prev, reviewWords: null }));

    try {
      await fetchReviewWords(userId, forceRefresh);
      setLocalReviewWords(storeReviewWords.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '復習単語データの取得に失敗しました';
      setError(prev => ({ ...prev, reviewWords: errorMessage }));
      console.error('Failed to fetch review words:', err);
    } finally {
      setLoading(prev => ({ ...prev, reviewWords: false }));
    }
  }, [userId, prefetchedData, localReviewWords.length, fetchReviewWords, storeReviewWords]);

  // 全データの更新
  const refreshAll = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (category) {
      promises.push(fetchWordsData(true));
    }
    promises.push(fetchCategoriesData(true));
    
    if (userId) {
      promises.push(fetchUserProgressData(true));
      promises.push(fetchReviewWordsData(true));
    }

    await Promise.all(promises);
  }, [category, userId, fetchWordsData, fetchCategoriesData, fetchUserProgressData, fetchReviewWordsData]);

  // 初期データ取得
  useEffect(() => {
    const initializeData = async () => {
      const promises: Promise<void>[] = [];

      if (category) {
        promises.push(fetchWordsData());
      }
      promises.push(fetchCategoriesData());
      
      if (userId) {
        promises.push(fetchUserProgressData());
        promises.push(fetchReviewWordsData());
      }

      await Promise.all(promises);
    };

    initializeData();
  }, [category, userId, fetchWordsData, fetchCategoriesData, fetchUserProgressData, fetchReviewWordsData]);

  // リアルタイム更新（オプション）
  useEffect(() => {
    if (!enableRealtime || updateInterval <= 0) return;

    const interval = setInterval(() => {
      refreshAll();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [enableRealtime, updateInterval, refreshAll]);

  // ストアの変更を監視
  useEffect(() => {
    if (category) {
      const storeData = getWordsByCategory(category);
      if (storeData.length > 0) {
        setLocalWords(storeData);
      }
    }
  }, [category, storeWords, getWordsByCategory]);

  useEffect(() => {
    if (storeCategories.data && storeCategories.data.length > 0) {
      setLocalCategories(storeCategories.data);
    }
  }, [storeCategories]);

  useEffect(() => {
    if (storeUserProgress.data && storeUserProgress.data.length >= 0) {
      setLocalUserProgress(storeUserProgress.data);
    }
  }, [storeUserProgress]);

  useEffect(() => {
    if (storeReviewWords.data && storeReviewWords.data.length >= 0) {
      setLocalReviewWords(storeReviewWords.data);
    }
  }, [storeReviewWords]);

  return {
    words: localWords,
    categories: localCategories,
    userProgress: localUserProgress,
    reviewWords: localReviewWords,
    loading,
    error,
    refresh: {
      words: () => fetchWordsData(true),
      categories: () => fetchCategoriesData(true),
      userProgress: () => fetchUserProgressData(true),
      reviewWords: () => fetchReviewWordsData(true),
      all: refreshAll,
    },
    cacheInfo,
  };
}

/**
 * 特定カテゴリーの単語のみを取得する便利なフック
 */
export function useWordsByCategory(category: string, userId?: string) {
  return useUnifiedData({
    category,
    userId,
    enableRealtime: false, // 単語データは頻繁に変更されないため無効
  });
}

/**
 * ユーザー進捗データのみを取得する便利なフック
 */
export function useUserProgressData(userId: string) {
  return useUnifiedData({
    userId,
    enableRealtime: true, // 進捗データは頻繁に更新されるため有効
    updateInterval: 60000, // 1分間隔
  });
}
