import { notFound, redirect } from 'next/navigation';
// import Link from 'next/link';
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
        category: category, // カテゴリー名はデータベースから取得したそのままの値を使用
      }));
    },
    [
      { category: '句動詞' },
      { category: '動詞' },
      { category: '名詞' },
      { category: '形容詞' },
      { category: '副詞' },
    ]
  );
}

export default async function OptionsPage({ params, searchParams }: PageProps) {
  // パラメータの取得と検証
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};

  if (!p?.category) notFound();

  const category = p.category;
  // カテゴリーパラメータをデコード
  const decodedCategory = decodeURIComponent(category);
  const mode = sp.mode === 'quiz' ? 'quiz' : sp.mode === 'flashcard' ? 'flashcard' : null;

  if (!mode) notFound();

  // カテゴリーの存在確認
  console.log('OptionsPage: カテゴリー確認開始', { category, mode });
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', decodedCategory)
      .eq('is_active', true)
      .single();

    if (categoryError || !categoryData) {
      console.log('OptionsPage: カテゴリーが存在しないためリダイレクト', {
        category,
        decodedCategory,
        error: categoryError?.message
      });
      redirect('/learning/categories');
    }

    console.log('OptionsPage: カテゴリー確認成功', {
      categoryId: categoryData.id,
      categoryName: categoryData.name
    });
  }

  // デバッグログ
  console.log('Options page params:', { category, decodedCategory, mode, sec: sp.sec, random: sp.random, count: sp.count, error: sp.error });

  // 最適化されたセクションデータを取得
  const sectionData = await optimizedSectionService.getSectionData(category);

  // エラーパラメータがない場合のみリダイレクト（ループ防止）
  if (!sp.error) {
    // secパラメータがある場合は直接学習ページにリダイレクト
    if (sp.sec) {
      const redirectUrl = `/learning/${encodeURIComponent(decodedCategory)}/${mode}/section/${encodeURIComponent(sp.sec)}`;
      console.log('Redirecting to:', redirectUrl);
      redirect(redirectUrl);
    }

    // ランダムモードのパラメータがある場合は、オプション画面を表示（リダイレクトしない）
    // ユーザーが「開始」ボタンをクリックした時のみリダイレクトする
    if (sp.random && sp.count) {
      console.log('ランダムモードパラメータ検出:', { 
        random: sp.random, 
        count: sp.count,
        action: 'オプション画面を表示（リダイレクトしない）'
      });
    }
  }

  return (
    <SectionOptionsClient
      category={decodedCategory}
      mode={mode}
      initialData={sectionData}
      error={sp.error}
    />
  );
}


