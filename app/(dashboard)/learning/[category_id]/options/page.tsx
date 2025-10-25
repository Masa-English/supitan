import { notFound, redirect } from 'next/navigation';
// import Link from 'next/link';
import { optimizedSectionService } from '@/lib/api/services/optimized-section-service';
import { SectionOptionsClient } from '@/components/features/learning/section-optimized/section-options-client';
import { getCategoryNameById } from '@/lib/constants/categories';

interface PageProps {
  params?: Promise<{ category_id: string }>;
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
        category_id: categoryId, // カテゴリーID（文字列）を使用
      }));
    },
    [
      { category_id: 'b464ce08-9440-4178-923f-4d251b8dc0ab' },
      { category_id: '6effaf5d-619c-4a70-b36d-9464549eadda' },
      { category_id: '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9' },
      { category_id: '71bfd0a1-cc79-4257-bd4a-15d30d37555f' },
      { category_id: '618464f6-6c7a-450a-9074-89e6d7becef9' },
    ]
  );
}

// カテゴリーIDから名前を取得（一時的に静的マッピングを使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  // 一時的に静的なマッピングを使用
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

export default async function OptionsPage({ params, searchParams }: PageProps) {
  // パラメータの取得と検証
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category_id) notFound();

  const category = p.category_id;
  // カテゴリーIDから名前を取得
  const categoryName = await getCategoryName(category);

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


