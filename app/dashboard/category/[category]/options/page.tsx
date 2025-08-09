import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, BookOpen, Brain } from 'lucide-react';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ mode?: string; size?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OptionsPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};
  if (!p?.category) notFound();
  const category = decodeURIComponent(p.category);
  const mode = sp.mode === 'quiz' ? 'quiz' : sp.mode === 'flashcard' ? 'flashcard' : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  if (!mode) notFound();

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
  const sections = Array.from(new Set((sectionsRaw || []).map(r => String((r as { section: number | string | null }).section ?? '未設定'))));

  const base = `/dashboard/category/${encodeURIComponent(category)}/${mode}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6 safe-bottom">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">学習オプション</h1>
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
            <Link
              href={`/dashboard/category/${encodeURIComponent(category)}`}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              aria-label="カテゴリーに戻る"
            >
              カテゴリーへ戻る
            </Link>
          </div>
        </div>

        {/* Step 1: セクションで開始 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. セクションを選んで開始</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sections.map((sec) => {
                const href = `/dashboard/category/${encodeURIComponent(category)}/${mode}?sec=${encodeURIComponent(sec)}`;
                return (
                  <Link key={sec} href={href} className="border border-border rounded-lg p-3 bg-card hover:shadow-md hover:border-primary/40 transition-colors" aria-label={`セクション${sec}で開始`}>
                    <div className="text-sm font-semibold text-foreground">セクション {sec}</div>
                    <div className="mt-2 text-xs text-primary underline">開始</div>
                  </Link>
                );
              })}
            </div>
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
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/category/${encodeURIComponent(category)}`}>カテゴリーに戻る</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2">指定した件数を{category}からランダムに出題します。</p>
                <form
                  action={async (formData) => {
                    'use server';
                    const count = Math.max(1, Number(formData.get('count') || '10'));
                    const url = `${base}?random=1&count=${count}`;
                    redirect(url);
                  }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
                >
                  <div>
                    <label className="text-sm font-medium" htmlFor="random-count">件数</label>
                    <Input id="random-count" type="number" name="count" min={1} defaultValue={10} className="w-full sm:w-40" />
                  </div>
                  <Button type="submit" aria-label="ランダムで開始" disabled={wordsCount === 0} size="mobile">開始 <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


