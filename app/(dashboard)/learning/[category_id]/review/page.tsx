import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReviewClient from './review-client';
import { getCategoryIdByName, getCategoryNameById } from '@/lib/constants/categories';
import type { UserProgress } from '@/lib/types/database';

const isDueForReview = (progress: UserProgress, now: Date) => {
  if (progress.next_review_at) {
    return new Date(progress.next_review_at) <= now;
  }

  if (!progress.last_studied) return false;

  const lastReview = new Date(progress.last_studied);
  const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
  const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
  const reviewInterval = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }[masteryLevel] || 1;

  return daysSinceReview >= reviewInterval;
};

interface PageProps {
  params?: Promise<{ category_id: string }>;
  searchParams?: Promise<{ mode?: string }>;
}

// ISR設定 - 5分ごとに再生成（データ更新を即座に反映）
export const revalidate = 300;

// カテゴリーIDから名前を取得（動的取得を使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  try {
    return await getCategoryNameById(categoryId);
  } catch (error) {
    console.error('Error getting category name:', error);
    return undefined;
  }
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category_id) notFound();
  const category = p.category_id;

  // カテゴリーIDから名前を取得
  const categoryName = await getCategoryName(category);
  if (!categoryName) notFound();

  // カテゴリー名から正規のUUIDを取得
  const categoryId = await getCategoryIdByName(categoryName);
  if (!categoryId) notFound();

  // 認証セッションチェック（サーバー側）
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 復習モードのパラメータ取得
  const mode = sp.mode || 'interval';

  // カテゴリー内の単語を取得（正規IDで検索）
  const [wordsInCategory, userProgress] = await Promise.all([
    dataProvider.getWordsByCategory(categoryId),
    dataProvider.getUserProgress(user.id)
  ]);

  const now = new Date();
  const progressMap = new Map(userProgress.map(p => [p.word_id, p]));
  let words = wordsInCategory.filter(word => {
    const progress = progressMap.get(word.id);
    return progress ? isDueForReview(progress, now) : false;
  });

  // 復習モードに応じて単語をフィルタリング
  if (mode === 'review-list') {
    // 復習リストの単語のみを取得
    const reviewWords = await dataProvider.getReviewWords(user.id);
    const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
    words = words.filter(word => {
      if (!reviewWordIds.has(word.id)) return false;
      const progress = progressMap.get(word.id);
      return progress ? isDueForReview(progress, now) : true;
    });
  }

  // 0件時の処理
  if (!words || words.length === 0) {
    redirect(`/learning/${category}/options?mode=quiz`);
  }

  return (
    <ReviewClient
      category={category}
      words={words}
      mode={mode as 'review-list' | 'interval' | 'urgent'}
    />
  );
}
