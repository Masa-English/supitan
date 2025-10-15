/**
 * 事前取得データを活用するフック
 * 重複したAPI呼び出しを防ぎ、パフォーマンスを向上
 */

'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/lib/stores/data-store-unified';

interface PrefetchDataOptions {
  categories?: boolean;
  words?: string[]; // カテゴリー名の配列
  userProgress?: boolean;
  reviewWords?: boolean;
}

interface PrefetchDataResult {
  loading: boolean;
  error: string | null;
  prefetched: boolean;
}

export function usePrefetchData(options: PrefetchDataOptions): PrefetchDataResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefetched, setPrefetched] = useState(false);

  const {
    fetchCategories,
    fetchWords,
    fetchUserProgress,
    fetchReviewWords,
    categories,
    words,
    userProgress,
    reviewWords
  } = useDataStore();

  useEffect(() => {
    const prefetchData = async () => {
      if (prefetched) return;

      setLoading(true);
      setError(null);

      try {
        const promises: Promise<unknown>[] = [];

        // カテゴリーの事前取得
        if (options.categories && !categories.data) {
          promises.push(fetchCategories());
        }

        // 単語の事前取得
        if (options.words && options.words.length > 0) {
          for (const category of options.words) {
            if (!words.data?.[category]) {
              promises.push(fetchWords(category));
            }
          }
        }

        // ユーザー認証状態を確認（実際の認証状態取得ロジックに置き換え）
        // ここでは簡易的に実装
        let currentUserId: string | null = null;
        try {
          const { createClient } = await import('@/lib/api/supabase/client');
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          currentUserId = user?.id || null;
        } catch (error) {
          console.warn('認証状態取得エラー:', error);
        }

        // ユーザー進捗の事前取得（認証済みの場合のみ）
        if (options.userProgress && !userProgress.data && currentUserId) {
          promises.push(fetchUserProgress(currentUserId));
        }

        // 復習単語の事前取得（認証済みの場合のみ）
        if (options.reviewWords && !reviewWords.data && currentUserId) {
          promises.push(fetchReviewWords(currentUserId));
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }

        setPrefetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの事前取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    prefetchData();
  }, [
    options.categories,
    options.words,
    options.userProgress,
    options.reviewWords,
    prefetched,
    categories.data,
    words.data,
    userProgress.data,
    reviewWords.data,
    fetchCategories,
    fetchWords,
    fetchUserProgress,
    fetchReviewWords
  ]);

  return {
    loading,
    error,
    prefetched
  };
}
