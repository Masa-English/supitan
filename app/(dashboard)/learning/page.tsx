import { redirect } from 'next/navigation';

interface LearningPageProps {
  searchParams?: Promise<{ mode?: string }>;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const sp = searchParams ? await searchParams : {};

  // クエリパラメータに基づいて適切な場所にリダイレクト
  const mode = sp.mode;

  if (mode === 'review') {
    redirect('/learning/categories?mode=review');
  } else if (mode === 'urgent-review') {
    redirect('/learning/categories?mode=review&urgent=true');
  } else if (mode === 'review-list') {
    redirect('/learning/categories?mode=review-list');
  } else {
    // その他の場合は通常のカテゴリ選択ページにリダイレクト
    redirect('/learning/categories');
  }
}