import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { optimizedSectionService } from '@/lib/api/services/optimized-section-service';
import { SectionOptionsClient } from '@/components/features/learning/section-optimized/section-options-client';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ mode?: string; size?: string; sec?: string; random?: string; count?: string; error?: string }>;
}

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

// 静的パスの生成
export async function generateStaticParams() {
  const { getBuildTimeCategories, safeGenerateStaticParams } = await import('@/lib/api/services/static-params-generator');
  
  return safeGenerateStaticParams(
    async () => {
      const categories = await getBuildTimeCategories();
      return categories.map((category) => ({
        category: encodeURIComponent(category),
      }));
    },
    [
      { category: encodeURIComponent('句動詞') },
      { category: encodeURIComponent('動詞') },
      { category: encodeURIComponent('名詞') },
      { category: encodeURIComponent('形容詞') },
      { category: encodeURIComponent('副詞') },
    ]
  );
}

export default async function OptionsPage({ params, searchParams }: PageProps) {
  // パラメータの取得と検証
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};
  
  if (!p?.category) notFound();
  
  const category = decodeURIComponent(p.category);
  const mode = sp.mode === 'quiz' ? 'quiz' : sp.mode === 'flashcard' ? 'flashcard' : null;

  if (!mode) notFound();

  // デバッグログ
  console.log('Options page params:', { category, mode, sec: sp.sec, random: sp.random, count: sp.count, error: sp.error });
  
  // 最適化されたセクションデータを取得
  const sectionData = await optimizedSectionService.getSectionData(category);

  // エラーパラメータがない場合のみリダイレクト（ループ防止）
  if (!sp.error) {
    // secパラメータがある場合は直接学習ページにリダイレクト
    if (sp.sec) {
      const redirectUrl = `/learning/${encodeURIComponent(category)}/${mode}/section/${encodeURIComponent(sp.sec)}`;
      console.log('Redirecting to:', redirectUrl);
      redirect(redirectUrl);
    }

    // randomパラメータがある場合は直接学習ページにリダイレクト
    if (sp.random && sp.count) {
      const redirectUrl = `/learning/${encodeURIComponent(category)}/${mode}?random=${sp.random}&count=${sp.count}`;
      console.log('Redirecting to:', redirectUrl);
      redirect(redirectUrl);
    }
  }

  return (
    <SectionOptionsClient
      category={category}
      mode={mode}
      initialData={sectionData}
    />
  );
}


