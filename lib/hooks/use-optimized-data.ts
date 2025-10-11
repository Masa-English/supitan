/**
 * 最適化されたデータフェッチングフック
 * Server ComponentとClient Componentの両方に対応
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import type { Word, Category, UserProgress, ReviewWord } from '@/lib/types';

// ============================================================================
// 型定義
// ============================================================================

interface UseOptimizedDataOptions {
  category?: string;
  userId?: string;
  prefetchedData?: {
    words?: Word[];
    categories?: Category[];
    userProgress?: UserProgress[];
    reviewWords?: ReviewWord[];
  };
  enabled?: boolean;
  revalidateOnMount?: boolean;
}

interface UseOptimizedDataReturn {
  words: Word[];
  categories: Category[];
  userProgress: Record<string, UserProgress>;
  reviewWords: ReviewWord[];
  loading: {
    words: boolean;
    categories: boolean;
    userProgress: boolean;
    reviewWords: boolean;
  };
  error: {
    words: string | null;
    categories: string | null;
    userProgress: string | null;
    reviewWords: string | null;
  };
  refetch: {
    words: () => Promise<void>;
    categories: () => Promise<void>;
    userProgress: () => Promise<void>;
    reviewWords: () => Promise<void>;
    all: () => Promise<void>;
  };
}

// ============================================================================
// カスタムフック
// ============================================================================

export function useOptimizedData(options: UseOptimizedDataOptions = {}): UseOptimizedDataReturn {
  const {
    category,
    userId,
    prefetchedData,
    enabled = true,
    revalidateOnMount = false,
  } = options;

  // 状態管理
  const [words, setWords] = useState<Word[]>(prefetchedData?.words || []);
  const [categories, setCategories] = useState<Category[]>(prefetchedData?.categories || []);
  const [userProgressList, setUserProgressList] = useState<UserProgress[]>(prefetchedData?.userProgress || []);
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>(prefetchedData?.reviewWords || []);
  
  const [loading, setLoading] = useState({
    words: !prefetchedData?.words && enabled,
    categories: !prefetchedData?.categories && enabled,
    userProgress: !prefetchedData?.userProgress && enabled && !!userId,
    reviewWords: !prefetchedData?.reviewWords && enabled && !!userId,
  });
  
  const [error, setError] = useState({
    words: null as string | null,
    categories: null as string | null,
    userProgress: null as string | null,
    reviewWords: null as string | null,
  });

  const supabase = createBrowserClient();

  // ユーザー進捗をマップ形式に変換
  const userProgress = useMemo(() => {
    const progressMap: Record<string, UserProgress> = {};
    userProgressList.forEach(progress => {
      if (progress.word_id) {
        progressMap[progress.word_id] = progress;
      }
    });
    return progressMap;
  }, [userProgressList]);

  // エラーハンドリング関数
  const handleError = useCallback((key: keyof typeof error, err: unknown) => {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(prev => ({ ...prev, [key]: message }));
    console.error(`Error fetching ${key}:`, err);
  }, []);

  // 単語データ取得
  const fetchWords = useCallback(async () => {
    if (!enabled) return;

    setLoading(prev => ({ ...prev, words: true }));
    setError(prev => ({ ...prev, words: null }));

    try {
      let query = supabase.from('words').select(`
        *,
        categories (
          id,
          name,
          description,
          icon,
          color,
          sort_order,
          is_active
        )
      `);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      query = query.order('id');
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setWords(data || []);
    } catch (err) {
      handleError('words', err);
    } finally {
      setLoading(prev => ({ ...prev, words: false }));
    }
  }, [enabled, category, supabase, handleError]);

  // カテゴリーデータ取得
  const fetchCategories = useCallback(async () => {
    if (!enabled) return;

    setLoading(prev => ({ ...prev, categories: true }));
    setError(prev => ({ ...prev, categories: null }));

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (fetchError) {
        throw fetchError;
      }
      
      setCategories(data || []);
    } catch (err) {
      handleError('categories', err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, [enabled, supabase, handleError]);

  // ユーザー進捗データ取得
  const fetchUserProgress = useCallback(async () => {
    if (!enabled || !userId) return;

    setLoading(prev => ({ ...prev, userProgress: true }));
    setError(prev => ({ ...prev, userProgress: null }));

    try {
      let query = supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      
      // 特定カテゴリーの単語に限定する場合
      if (category && words.length > 0) {
        const wordIds = words.map(word => word.id);
        query = query.in('word_id', wordIds);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setUserProgressList(data || []);
    } catch (err) {
      handleError('userProgress', err);
    } finally {
      setLoading(prev => ({ ...prev, userProgress: false }));
    }
  }, [enabled, userId, category, words, supabase, handleError]);

  // 復習単語データ取得
  const fetchReviewWords = useCallback(async () => {
    if (!enabled || !userId) return;

    setLoading(prev => ({ ...prev, reviewWords: true }));
    setError(prev => ({ ...prev, reviewWords: null }));

    try {
      const { data, error: fetchError } = await supabase
        .from('review_words')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString())
        .order('next_review');
      
      if (fetchError) {
        throw fetchError;
      }
      
      setReviewWords(data || []);
    } catch (err) {
      handleError('reviewWords', err);
    } finally {
      setLoading(prev => ({ ...prev, reviewWords: false }));
    }
  }, [enabled, userId, supabase, handleError]);

  // 全データ再取得
  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchWords(),
      fetchCategories(),
      fetchUserProgress(),
      fetchReviewWords(),
    ]);
  }, [fetchWords, fetchCategories, fetchUserProgress, fetchReviewWords]);

  // 初期データ取得
  useEffect(() => {
    if (!enabled) return;

    const shouldFetch = revalidateOnMount || !prefetchedData;
    
    if (shouldFetch) {
      if (!prefetchedData?.words) {
        fetchWords();
      }
      if (!prefetchedData?.categories) {
        fetchCategories();
      }
    }
  }, [enabled, revalidateOnMount, prefetchedData, fetchWords, fetchCategories]);

  // ユーザー依存データの取得
  useEffect(() => {
    if (!enabled || !userId) return;

    const shouldFetch = revalidateOnMount || !prefetchedData;
    
    if (shouldFetch) {
      if (!prefetchedData?.userProgress) {
        fetchUserProgress();
      }
      if (!prefetchedData?.reviewWords) {
        fetchReviewWords();
      }
    }
  }, [enabled, userId, revalidateOnMount, prefetchedData, fetchUserProgress, fetchReviewWords]);

  // カテゴリー変更時の単語データ再取得
  useEffect(() => {
    if (!enabled || !category) return;
    
    // prefetchedDataがある場合は初回スキップ
    if (prefetchedData?.words && !revalidateOnMount) return;
    
    fetchWords();
  }, [category, enabled, fetchWords, prefetchedData, revalidateOnMount]);

  return {
    words,
    categories,
    userProgress,
    reviewWords,
    loading,
    error,
    refetch: {
      words: fetchWords,
      categories: fetchCategories,
      userProgress: fetchUserProgress,
      reviewWords: fetchReviewWords,
      all: refetchAll,
    },
  };
}

// ============================================================================
// 便利なセレクター関数
// ============================================================================

/**
 * 特定カテゴリーの単語のみを取得
 */
export function useWordsByCategory(category: string, options?: Omit<UseOptimizedDataOptions, 'category'>) {
  const result = useOptimizedData({ ...options, category });
  
  return {
    words: result.words,
    loading: result.loading.words,
    error: result.error.words,
    refetch: result.refetch.words,
  };
}

/**
 * ユーザーの学習統計を計算
 */
export function useLearningStats(userId?: string, options?: UseOptimizedDataOptions) {
  const { words, userProgress, loading, error } = useOptimizedData({ ...options, userId });
  
  const stats = useMemo(() => {
    if (!userId || loading.words || loading.userProgress) {
      return null;
    }
    
    const totalWords = words.length;
    const studiedWords = Object.keys(userProgress).length;
    const masteredWords = Object.values(userProgress).filter(p => (p.mastery_level || 0) >= 5).length;
    const favoriteWords = Object.values(userProgress).filter(p => p.is_favorite).length;
    
    const totalStudyCount = Object.values(userProgress).reduce((sum, p) => sum + (p.study_count || 0), 0);
    const totalCorrectCount = Object.values(userProgress).reduce((sum, p) => sum + (p.correct_count || 0), 0);
    
    const accuracy = totalStudyCount > 0 ? (totalCorrectCount / totalStudyCount) * 100 : 0;
    
    return {
      totalWords,
      studiedWords,
      masteredWords,
      favoriteWords,
      unstudiedWords: totalWords - studiedWords,
      accuracy: Math.round(accuracy * 100) / 100,
      studyCount: totalStudyCount,
    };
  }, [words, userProgress, userId, loading]);
  
  return {
    stats,
    loading: loading.words || loading.userProgress,
    error: error.words || error.userProgress,
  };
}
