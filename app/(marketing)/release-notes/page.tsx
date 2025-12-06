import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
import { Button } from '@/components/ui/button';
import { Clock, NotebookPen, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'リリースノート | スピ単',
  description: '最新のアップデート情報をお知らせするためのリリースノートです。公開準備中のためプレースホルダーを表示しています。',
  robots: {
    index: false,
    follow: false
  }
};

export default function ReleaseNotesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-10">
        <header className="space-y-4 text-center">
          <div className="flex justify-center">
            <Badge variant="outline" className="px-3 py-1 text-xs">
              PREVIEW
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            リリースノート
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            プロダクトの変更点や改善点をここで整理します。正式公開までは概要のみのプレースホルダーを表示しています。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" prefetch>
              <Button variant="outline" size="sm">
                ご意見・リクエストを送る
              </Button>
            </Link>
            <Button variant="ghost" size="sm" disabled className="cursor-not-allowed opacity-70">
              通知購読（準備中）
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">直近の公開予定</CardTitle>
                <p className="text-sm text-muted-foreground">ロードマップの簡易サマリー</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-foreground">リリースノート本文表示・フィルタ</p>
                  <p className="text-muted-foreground">タグや期間で絞り込める一覧を追加予定です。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-foreground">メール／アプリ内通知</p>
                  <p className="text-muted-foreground">更新をフォローできる購読機能を計画中です。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-foreground">変更の重要度ラベル</p>
                  <p className="text-muted-foreground">破壊的変更や新機能をラベルで明示します。</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">公開済みアップデート</CardTitle>
                <p className="text-sm text-muted-foreground">タイムライン（近日公開）</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                <p>リリース履歴は準備中です。</p>
                <p>公開後、このセクションにバージョン別の変更点を表示します。</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <NotebookPen className="w-4 h-4" />
                <span>初回リリースノート公開までお待ちください。</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30 border border-border">
          <CardHeader>
            <CardTitle className="text-base">掲載ポリシー（ドラフト）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>・ユーザー影響の大きい変更から先に記載します。</p>
            <p>・不具合修正は再現条件と解決内容を簡潔にまとめます。</p>
            <p>・リリース日のタイムゾーンは JST を基本とします。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
