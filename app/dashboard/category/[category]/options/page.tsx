import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
// 認証不要の公開データ読み取りは cookies を使わないクライアントで行う
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, BookOpen, Brain, ArrowLeft } from 'lucide-react';
import { SectionLink } from './section-link';
import { RandomInput } from './random-input';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ mode?: string; size?: string }>;
}

// ISR/プリフェッチを活用するため動的レンダリングを外す
export const revalidate = 300; // 5分

export default async function OptionsPage({ params, searchParams }: PageProps) {
  // パラメータの取得と検証
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};
  
  if (!p?.category) notFound();
  
  const category = decodeURIComponent(p.category);
  const mode = sp.mode === 'quiz' ? 'quiz' : sp.mode === 'flashcard' ? 'flashcard' : null;

  if (!mode) notFound();

  // Supabaseクライアントの初期化
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 総件数を取得（カテゴリー内）
  const { count: totalCount, error: countErr } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true })
    .eq('category', category);
  
  if (countErr) notFound();
  const wordsCount = totalCount || 0;

  // sectionのユニーク値を取得
  const { data: sectionsRaw, error: secErr } = await supabase
    .from('words')
    .select('section')
    .eq('category', category)
    .order('section', { ascending: true });
  
  if (secErr) notFound();
  
  const sections = Array.from(
    new Set(
      (sectionsRaw || []).map((r: { section: number | string | null }) => 
        String(r.section ?? '未設定')
      )
    )
  );

  const base = `/dashboard/category/${encodeURIComponent(category)}/${mode}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
            href="/dashboard/start-learning/category"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            aria-label="カテゴリー選択に戻る"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            カテゴリー選択に戻る
          </Link>
          <h1 className="text-2xl font-bold">学習オプション</h1>
          </div>
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
            <span className="flex-1" />
          </div>
        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
        {/* Step 1: セクションで開始 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. セクションを選んで開始</CardTitle>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">このカテゴリーにはセクションがありません。</p>
                {wordsCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">単語が0件です。</p>
                )}
                <div className="mt-3 flex gap-2">
                    <Link
                      href="/dashboard/start-learning/category"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    カテゴリー選択に戻る
                  </Link>
                    <Link
                      href={`/dashboard/category/${encodeURIComponent(category)}/browse`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    一覧を見る
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sections.map((sec: string) => {
                  const href = `/dashboard/category/${encodeURIComponent(category)}/${mode}/section/${encodeURIComponent(sec)}`;
                  return (
                    <SectionLink key={sec} href={href} section={sec} />
                  );
                })}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-3" aria-live="polite">
              総単語: {wordsCount} / セクション数: {sections.length}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: ランダムで開始 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. ランダムで学習</CardTitle>
          </CardHeader>
          <CardContent>
            {wordsCount === 0 ? (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">このカテゴリーにはまだ単語がありません。</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/dashboard/start-learning/category"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    カテゴリー選択に戻る
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2">指定した件数を{category}からランダムに出題します。</p>
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
                       <label className="text-sm font-medium" htmlFor="random-count">件数</label>
                       <RandomInput 
                         wordsCount={wordsCount}
                         defaultValue={Math.min(10, wordsCount)}
                       />
                     </div>
                     <Button type="submit" aria-label="ランダムで開始" disabled={wordsCount === 0} size="sm">
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


