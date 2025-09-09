import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
// 認証不要の公開データ読み取りは cookies を使わないクライアントで行う
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
import { ArrowRight, Layers, BookOpen, Brain, ArrowLeft } from 'lucide-react';
import { SectionLink } from './section-link';
import { RandomInput } from './random-input';

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
  
  // Supabaseクライアントの初期化（デバッグ用に早期に移動）
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 総件数を取得（カテゴリー内）
  const { count: totalCount, error: countErr } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true })
    .eq('category', category);
  
  if (countErr) {
    console.error('Count error:', countErr);
    notFound();
  }
  const wordsCount = totalCount || 0;

  // sectionのユニーク値を取得
  const { data: sectionsRaw, error: secErr } = await supabase
    .from('words')
    .select('section')
    .eq('category', category)
    .order('section', { ascending: true });
  
  if (secErr) {
    console.error('Sections error:', secErr);
    notFound();
  }
  
  const sections = Array.from(
    new Set(
      (sectionsRaw || []).map((r: { section: number | string | null }) => 
        String(r.section ?? '未設定')
      )
    )
  );

  console.log('Available sections:', sections);
  console.log('Total words count:', wordsCount);

  // セクション別の単語数を確認
  for (const section of sections) {
    const { count: sectionCount } = await supabase
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('category', category)
      .eq('section', section === '未設定' ? null : section);
    console.log(`Section ${section}: ${sectionCount} words`);
  }

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



  const base = `/learning/${encodeURIComponent(category)}/${mode}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
            href="/learning/categories"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            aria-label="カテゴリー選択に戻る"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            カテゴリー選択に戻る
          </Link>
          <h1 className="text-2xl font-bold">学習オプション</h1>
          {sp.error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {sp.error === 'no_words' && '選択されたセクションに単語がありません。別のオプションを選択してください。'}
                {sp.error === 'no_params' && '学習パラメータが指定されていません。下記から選択してください。'}
                {sp.error === 'auth_error' && '認証エラーが発生しました。再度お試しください。'}
                {sp.error === 'auth_failed' && '認証の確認に失敗しました。再度お試しください。'}
                {sp.error === 'data_error' && 'データの取得に失敗しました。再度お試しください。'}
                {sp.error === 'no_data' && 'データが見つかりませんでした。'}
              </p>
            </div>
          )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Layers className="h-3 w-3 mr-1" /> カテゴリー
              </Badge>
              <span className="text-sm font-medium text-foreground">{category}</span>
              <span className="text-muted-foreground">·</span>
              <Badge variant="secondary" className="text-xs">
                {mode === 'quiz' ? <Brain className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />} モード
              </Badge>
              <span className="text-sm font-medium text-foreground">{mode}</span>
            </div>
            <Link href={`/learning/${encodeURIComponent(category)}/browse`}>
              <Button variant="outline" size="sm" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                単語一覧
              </Button>
            </Link>
          </div>
        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
        {/* ❶ 順番通り */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">❶ 順番通り</CardTitle>
          </CardHeader>
          <CardContent>
            {wordsCount === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">このカテゴリーにはまだ単語がありません。</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/learning/categories"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    カテゴリー選択に戻る
                  </Link>
                  <Link
                    href={`/learning/${encodeURIComponent(category)}/browse`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    一覧を見る
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  単語を順番通りに学習します。セクション別に分かれている場合は、セクションを選択してください。
                </p>
                {sections.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">セクションがない場合は、全ての単語を順番通りに学習します。</p>
                    <Link href={`${base}`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        全ての単語を順番通りに開始 ({wordsCount}個)
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {sections.map((sec: string) => {
                      const href = `${base}/section/${encodeURIComponent(sec)}`;
                      return (
                        <SectionLink key={sec} href={href} section={sec} />
                      );
                    })}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-3" aria-live="polite">
                  総単語: {wordsCount} / セクション数: {sections.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ❷ ランダム */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">❷ ランダム</CardTitle>
          </CardHeader>
          <CardContent>
            {wordsCount === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">このカテゴリーにはまだ単語がありません。</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/learning/categories"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    カテゴリー選択に戻る
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  指定した件数を{category}からランダムに出題します。
                </p>
                
                {/* クイック選択ボタン */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link href={`${base}?random=1&count=10`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      10問
                    </Button>
                  </Link>
                  <Link href={`${base}?random=1&count=20`}>
                    <Button size="sm" variant="outline">
                      20問
                    </Button>
                  </Link>
                  <Link href={`${base}?random=1&count=50`}>
                    <Button size="sm" variant="outline">
                      50問
                    </Button>
                  </Link>
                  {wordsCount >= 100 && (
                    <Link href={`${base}?random=1&count=100`}>
                      <Button size="sm" variant="outline">
                        100問
                      </Button>
                    </Link>
                  )}
                </div>

                {/* カスタム件数入力 */}
                <form
                  action={async (formData) => {
                    'use server';
                    
                    // フォームデータから件数を取得し、制約を適用
                    const inputCount = Number(formData.get('count') || '10');
                    const count = Math.max(1, Math.min(wordsCount, inputCount));
                    
                    // リダイレクトURLを生成
                    const url = `${base}?random=1&count=${count}`;
                    redirect(url);
                  }}
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div>
                      <label className="text-sm font-medium" htmlFor="random-count">カスタム件数</label>
                      <RandomInput 
                        wordsCount={wordsCount}
                        defaultValue={Math.min(10, wordsCount)}
                      />
                    </div>
                    <Button type="submit" aria-label="カスタム件数で開始" disabled={wordsCount === 0} size="sm">
                      開始 <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  {/* 制約情報 */}
                  <div className="text-xs text-muted-foreground">
                    設定可能範囲: 1 ～ {wordsCount}問
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        </div>
      </main>
    </div>
  );
}


