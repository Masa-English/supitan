import { fetchWordsForStudy } from '@/lib/server-word-fetcher';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import FlashcardClient from './flashcard-client';
import { redirect } from 'next/navigation';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ sec?: string; size?: string; random?: string; count?: string }>;
}

// 静的最適化を有効化（学習条件はクエリで分岐するため）
export const revalidate = 60; // 1分

export default async function FlashcardPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};
  if (!p?.category) notFound();
  const category = decodeURIComponent(p.category);
  const sectionRaw = sp.sec;
  const isRandom = sp.random === '1' || sp.random === 'true';
  const randomCount = sp.count ? Number(sp.count) : undefined;

  // 認証セッションチェック（サーバー側）
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // セーフガード: パラメータ未指定時はオプションへ
  const hasSection = !!sectionRaw;
  const hasRandom = isRandom && (randomCount ?? 0) > 0;
  if (!hasSection && !hasRandom) {
    redirect(`/dashboard/category/${encodeURIComponent(category)}/options?mode=flashcard`);
  }

  const words = await fetchWordsForStudy({
    category,
    sectionValue: isRandom ? undefined : sectionRaw,
    randomCount: isRandom ? (randomCount ?? 10) : undefined,
  });

  // 0件時はオプションへ戻し、画面で案内
  if (!words || words.length === 0) {
    redirect(`/dashboard/category/${encodeURIComponent(category)}/options?mode=flashcard`);
  }

  // key 生成の不要な未定義変数を除去
  const listKey = `${category}-${sectionRaw ?? ''}-${randomCount ?? 0}-${isRandom}`;

  return (
    <FlashcardClient
      category={category}
      words={words}
      key={listKey}
    />
  );
}