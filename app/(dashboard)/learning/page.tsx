import { redirect } from 'next/navigation';

interface LearningPageProps {
  searchParams?: Promise<{ mode?: string; level?: string }>;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const sp = searchParams ? await searchParams : {};

  // クエリパラメータに基づいて適切な場所にリダイレクト
  const mode = sp.mode;
  const level = sp.level;

  if (mode === 'review') {
    // 復習モードの場合はレベル指定があれば追加
    const reviewUrl = level ? `/learning/categories?mode=review&level=${level}` : '/learning/categories?mode=review';
    redirect(reviewUrl);
  } else if (mode === 'urgent-review') {
    redirect('/learning/categories?mode=review&urgent=true');
  } else if (mode === 'review-list') {
    redirect('/learning/categories?mode=review-list');
  } else {
    // その他の場合は通常のカテゴリ選択ページにリダイレクト
    redirect('/learning/categories');
  }
}