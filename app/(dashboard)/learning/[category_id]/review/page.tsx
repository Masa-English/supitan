import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReviewClient from './review-client';
// import { getCategoryNameById } from '@/lib/constants/categories'; // 未使用のためコメントアウト

interface PageProps {
  params?: Promise<{ category_id: string }>;
  searchParams?: Promise<{ mode?: string; level?: string }>;
}

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

// カテゴリーIDから名前を取得（一時的に静的マッピングを使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  const categoryMap: Record<string, string> = {
    'b464ce08-9440-4178-923f-4d251b8dc0ab': '動詞',
    '6effaf5d-619c-4a70-b36d-9464549eadda': '句動詞',
    '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9': '形容詞',
    '71bfd0a1-cc79-4257-bd4a-15d30d37555f': '副詞',
    '618464f6-6c7a-450a-9074-89e6d7becef9': '名詞',
    'db7620f6-7347-4cec-8a88-da3f8a27cc98': 'フレーズ',
    'fd181354-21ea-48d7-b4fa-8b6e1ca0264c': 'イディオム',
    '301aab35-e5ee-4136-98ba-ca272bb813d4': 'リアクション',
    '5a55ffb9-d020-49ac-81be-a256d7a24c8f': 'イディオム (副詞句)',
    '41240a24-458d-4184-9ef6-e8d1c8620d9d': 'イディオム(動詞+名詞句)',
    'ee6355f8-bd2d-46f3-8342-ccb80369c185': 'コロケーション',
    'b4bec9d1-a451-47f4-b1b6-2b1f0ef586f8': 'コロケーション（動詞+前置詞＋名詞)',
    '10d85f98-a88b-4f28-a20f-0a5b9851ff02': 'コロケーション（動詞+名詞型)',
    'c6ab103e-e829-41e0-9482-85e8e0a59b25': 'コロケーション（形容詞+前置詞型）',
    '47f218b0-1a67-4ce3-86bf-503cbcbc4376': '基礎動詞'
  };
  
  return categoryMap[categoryId];
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category_id) notFound();
  const category = p.category_id;

  // カテゴリーIDから名前を取得
  const categoryName = await getCategoryName(category);
  if (!categoryName) notFound();

  // 認証セッションチェック（サーバー側）
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 復習モードのパラメータ取得
  const mode = sp.mode || 'interval';
  const level = sp.level ? Number(sp.level) : undefined;

  // レベルが有効範囲外の場合はリダイレクト
  if (level && (level < 1 || level > 5)) {
    redirect(`/learning/${category}/review?mode=${mode}`);
  }

  // カテゴリー内の単語を取得
  let words = await dataProvider.getWordsByCategory(categoryName);

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
    redirect(`/learning/${category}/options?mode=quiz`);
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
