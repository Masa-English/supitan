import { notFound, redirect } from 'next/navigation';
// import Link from 'next/link';
import { optimizedSectionService } from '@/lib/api/services/optimized-section-service';
import { SectionOptionsClient } from '@/components/features/learning/section-optimized/section-options-client';
import { CATEGORIES } from '@/lib/constants/categories';

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
      return categories.map((categoryId) => ({
        category: categoryId, // カテゴリーID（文字列）を使用
      }));
    },
    [
      { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab' },
      { category: '6effaf5d-619c-4a70-b36d-9464549eadda' },
      { category: '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9' },
      { category: '71bfd0a1-cc79-4257-bd4a-15d30d37555f' },
      { category: '618464f6-6c7a-450a-9074-89e6d7becef9' },
    ]
  );
}

// カテゴリーIDから名前を取得
function getCategoryName(categoryId: string): string | undefined {
  const category = CATEGORIES.find((cat: { id: string }) => cat.id === categoryId);
  return category?.name;
}

export default async function OptionsPage({ params, searchParams }: PageProps) {
  // パラメータの取得と検証
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category) notFound();

  const category = p.category;
  // カテゴリーIDから名前を取得
  const categoryName = getCategoryName(category);

  if (!categoryName) notFound();

  const mode = sp.mode === 'quiz' ? 'quiz' : sp.mode === 'flashcard' ? 'flashcard' : null;

  if (!mode) notFound();

  // カテゴリーの存在確認
  console.log('OptionsPage: カテゴリー確認開始', { category, categoryName, mode });

  // カテゴリーIDの検証（categories.tsから取得した名前が有効か確認）
  if (!categoryName) {
    console.log('OptionsPage: カテゴリーIDが無効のためリダイレクト', {
      category,
      error: 'Category ID not found in configuration'
    });
    redirect('/learning/categories');
  }

  console.log('OptionsPage: カテゴリー確認成功', {
    categoryId: category,
    categoryName: categoryName
  });

  // デバッグログ
  console.log('Options page params:', { category, categoryName, mode, sec: sp.sec, random: sp.random, count: sp.count, error: sp.error });

  // 最適化されたセクションデータを取得
  const sectionData = await optimizedSectionService.getSectionData(category);

  // エラーパラメータがない場合のみリダイレクト（ループ防止）
  if (!sp.error) {
    // secパラメータがある場合は直接学習ページにリダイレクト
    if (sp.sec) {
      const redirectUrl = `/learning/${category}/${mode}/section/${sp.sec}`;
      console.log('Redirecting to:', redirectUrl);
      redirect(redirectUrl);
    }

    // ランダムモードのパラメータがある場合は、学習ページにリダイレクト
    if (sp.random && sp.count) {
      const redirectUrl = `/learning/${category}/${mode}?random=${sp.random}&count=${sp.count}`;
      console.log('ランダムモードパラメータ検出、学習ページにリダイレクト:', {
        random: sp.random,
        count: sp.count,
        category: category,
        categoryName: categoryName,
        redirectUrl
      });
      redirect(redirectUrl);
    }
  } else {
    console.log('エラーパラメータ検出、リダイレクトをスキップ:', sp.error);
  }

  return (
    <SectionOptionsClient
      category={category}
      mode={mode}
      initialData={sectionData}
      error={sp.error}
    />
  );
}


