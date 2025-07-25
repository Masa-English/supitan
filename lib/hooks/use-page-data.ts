'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word, UserProgress, ReviewWord } from '@/lib/types';

interface UsePageDataOptions {
  category?: string;
  type: 'flashcard' | 'quiz' | 'review';
  prefetchedData?: {
    words?: Word[];
    userProgress?: UserProgress[];
  };
}

interface UsePageDataReturn {
  words: Word[];
  userProgress: Record<string, UserProgress>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Client Component用の軽量データフック
 * Server Componentから事前取得したデータを優先的に使用
 */
export function usePageData(options: UsePageDataOptions): UsePageDataReturn {
  const [words, setWords] = useState<Word[]>(options.prefetchedData?.words || []);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(!options.prefetchedData?.words);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

  // ユーザー認証の確認
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('認証エラー:', err);
        setError('認証に失敗しました');
      }
    };

    getUser();
  }, [supabase.auth]);

  // データ取得関数
  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // 事前取得されたデータがある場合はスキップ
      if (options.prefetchedData?.words && words.length > 0) {
        if (options.prefetchedData.userProgress) {
          const progressMap: Record<string, UserProgress> = {};
          options.prefetchedData.userProgress.forEach(progress => {
            if (progress.word_id) {
              progressMap[progress.word_id] = progress;
            }
          });
          setUserProgress(progressMap);
        }
        setLoading(false);
        return;
      }

      let fetchedWords: Word[] = [];
      
      // 単語データの取得
      switch (options.type) {
        case 'flashcard':
        case 'quiz':
          if (options.category) {
            fetchedWords = await db.getWordsByCategory(options.category);
          }
          break;
        case 'review':
          const reviewWords = await db.getDueReviewWords(user.id);
          if (reviewWords.length > 0) {
            const allWords = await db.getWords();
            const wordIds = reviewWords.map((rw: ReviewWord) => rw.word_id);
            fetchedWords = allWords.filter((word: Word) => wordIds.includes(word.id));
          }
          break;
      }

      setWords(fetchedWords);

      // ユーザー進捗データの取得
      if (fetchedWords.length > 0) {
        const progressData = await db.getUserProgress(user.id);
        const progressMap: Record<string, UserProgress> = {};
        progressData.forEach((progress: UserProgress) => {
          if (progress.word_id) {
            progressMap[progress.word_id] = progress;
          }
        });
        setUserProgress(progressMap);
      }
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.id, options.category, options.type, options.prefetchedData, words.length, db]);

  // データの再取得
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // 初回データ取得
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  return {
    words,
    userProgress,
    loading,
    error,
    refetch,
  };
}

/**
 * Server Side Props用のデータ取得ヘルパー
 */
export async function getServerSidePageData(
  type: 'flashcard' | 'quiz' | 'review',
  category?: string,
  userId?: string
): Promise<{
  words: Word[];
  userProgress: UserProgress[];
}> {
  const db = new DatabaseService();

  try {
    let words: Word[] = [];
    let userProgress: UserProgress[] = [];

    // 単語データの取得
    switch (type) {
      case 'flashcard':
      case 'quiz':
        if (category) {
          words = await db.getWordsByCategory(category);
        }
        break;
      case 'review':
        if (userId) {
          const reviewWords = await db.getDueReviewWords(userId);
          if (reviewWords.length > 0) {
            const allWords = await db.getWords();
            const wordIds = reviewWords.map(rw => rw.word_id);
            words = allWords.filter(word => wordIds.includes(word.id));
          }
        }
        break;
    }

    // ユーザー進捗データの取得
    if (userId && words.length > 0) {
      userProgress = await db.getUserProgress(userId);
    }

    return { words, userProgress };
  } catch (error) {
    console.error('Server-side data fetch error:', error);
    return { words: [], userProgress: [] };
  }
} 