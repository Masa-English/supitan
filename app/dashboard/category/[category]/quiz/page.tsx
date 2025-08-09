import { fetchWordsForStudy } from '@/lib/server-word-fetcher';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './quiz-client';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ sec?: string; size?: string; random?: string; count?: string }>;
}

// 静的最適化を有効化
export const revalidate = 60; // 1分

export default async function QuizPage({ params, searchParams }: PageProps) {
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
    redirect(`/dashboard/category/${encodeURIComponent(category)}/options?mode=quiz`);
  }

  const words = await fetchWordsForStudy({
    category,
    sectionValue: isRandom ? undefined : sectionRaw,
    randomCount: isRandom ? (randomCount ?? 10) : undefined,
  });

  const listKey = `${category}-${sectionRaw ?? ''}-${randomCount ?? 0}-${isRandom}`;

  return (
    <QuizClient
      category={category}
      words={words}
      key={listKey}
    />
  );
}