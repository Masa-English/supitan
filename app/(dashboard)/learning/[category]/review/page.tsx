import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReviewClient from './review-client';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ mode?: string; level?: string }>;
}

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category) notFound();
  const category = decodeURIComponent(p.category);

  // 認証セッションチェック（サーバー側）
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 復習モードのパラメータ取得
  const mode = sp.mode || 'interval';
  const level = sp.level ? Number(sp.level) : undefined;

  // レベルが有効範囲外の場合はリダイレクト
  if (level && (level < 1 || level > 5)) {
    redirect(`/learning/${encodeURIComponent(category)}/review?mode=${mode}`);
  }

  // カテゴリー内の単語を取得
  let words = await dataProvider.getWordsByCategory(category);

  // 復習モードに応じて単語をフィルタリング
  if (mode === 'review-list') {
    // 復習リストの単語のみを取得
    const reviewWords = await dataProvider.getReviewWords(user.id);
    const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
    words = words.filter(word => reviewWordIds.has(word.id));
  } else if (mode === 'interval') {
    // 間隔復習が必要な単語を取得
    const userProgress = await dataProvider.getUserProgress(user.id);
    const now = new Date();

    const intervalReviewWords = userProgress.filter(progress => {
      if (!progress.last_studied) return false;
      const lastReview = new Date(progress.last_studied);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      // 習得レベルに応じた復習間隔
      const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
      const reviewInterval = {
        1: 1, 2: 3, 3: 7, 4: 14, 5: 30
      }[masteryLevel] || 1;

      // レベル指定がある場合はそのレベルのみ
      if (level !== undefined && masteryLevel !== level) return false;

      return daysSinceReview >= reviewInterval;
    });

    // 復習対象の単語IDを取得
    const reviewWordIds = new Set(intervalReviewWords.map(p => p.word_id));

    // カテゴリー内の復習対象単語のみをフィルタ
    words = words.filter(word => reviewWordIds.has(word.id));
  } else if (mode === 'urgent') {
    // 緊急復習が必要な単語を取得
    const userProgress = await dataProvider.getUserProgress(user.id);
    const now = new Date();

    const urgentReviewWords = userProgress.filter(progress => {
      if (!progress.last_studied) return false;
      const lastReview = new Date(progress.last_studied);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      // 習得レベルに応じた復習間隔
      const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
      const reviewInterval = {
        1: 1, 2: 3, 3: 7, 4: 14, 5: 30
      }[masteryLevel] || 1;

      // 予定の2倍経過している場合を緊急復習とする
      return daysSinceReview >= reviewInterval * 2;
    });

    // 復習対象の単語IDを取得
    const reviewWordIds = new Set(urgentReviewWords.map(p => p.word_id));

    // カテゴリー内の復習対象単語のみをフィルタ
    words = words.filter(word => reviewWordIds.has(word.id));
  }

  // 0件時の処理
  if (!words || words.length === 0) {
    redirect(`/learning/${encodeURIComponent(category)}/options?mode=quiz`);
  }

  return (
    <ReviewClient
      category={category}
      words={words}
      mode={mode as 'review-list' | 'interval' | 'urgent'}
      level={level}
    />
  );
}
