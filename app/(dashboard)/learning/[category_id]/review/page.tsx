import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReviewClient from './review-client';
import { getCategoryIdByName, getCategoryNameById } from '@/lib/constants/categories';

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
  let words = await dataProvider.getWordsByCategory(categoryId);

  // 復習モードに応じて単語をフィルタリング
  if (mode === 'review-list') {
    // 復習リストの単語のみを取得
    const reviewWords = await dataProvider.getReviewWords(user.id);
    const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
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
    />
  );
}
