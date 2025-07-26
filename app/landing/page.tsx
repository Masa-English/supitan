import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Clock, RotateCcw } from 'lucide-react';
import { StatsCardSkeleton, CategoryCardSkeleton } from '@/components/ui/skeleton';
import { LandingLayout } from '@/components/layouts/landing-layout';
import Link from 'next/link';

// 静的生成の設定 - より頻繁な更新で最新情報を提供
export const revalidate = 900; // 15分ごとに再生成

// 静的パラメータ生成（将来的な拡張用）
export async function generateStaticParams() {
  return [{}]; // ランディングページは単一ページ
}

// メタデータ最適化
export async function generateMetadata() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();
  return {
    title: 'Masa Flash - 効率的な英語学習アプリ',
    description: `${staticData.totalWords}個の単語で効率的に英語を学習。フラッシュカード、クイズ、復習システムで語彙力アップ！`,
    keywords: ['英語学習', 'フラッシュカード', 'クイズ', '復習', '英単語', '語学学習'],
    openGraph: {
      title: 'Masa Flash - 効率的な英語学習アプリ',
      description: `${staticData.totalWords}個の単語で効率的に英語を学習`,
      type: 'website',
    },
  };
}

// 非同期で統計データを取得するコンポーネント
async function StatisticsSection() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            総単語数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {staticData.totalWords}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Target className="h-4 w-4" />
            カテゴリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {staticData.categories.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            学習モード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            3
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Clock className="h-4 w-4" />
            最終更新
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-primary">
            {new Date(staticData.lastUpdated).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 非同期でカテゴリーデータを取得するコンポーネント
async function CategoriesSection() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
        学習カテゴリー
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {staticData.categories.map((category) => (
          <Card key={category.name} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Badge variant="outline" className="text-lg font-bold border-primary text-primary">
                  {category.pos}
                </Badge>
              </div>
              <CardTitle className="text-xl text-foreground">
                {category.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.englishName}
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {category.count}個の単語
              </p>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  学習開始
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 統計セクションのスケルトン
function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// カテゴリーセクションのスケルトン
function CategoriesSkeleton() {
  return (
    <div className="mb-12">
      <div className="h-8 w-64 bg-muted rounded mx-auto mb-8 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            効率的な英語学習を始めましょう
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            単語数読み込み中...個の単語で、あなたの英語力を向上させます
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3">
              無料で始める
            </Button>
          </Link>
        </div>

        {/* 統計カード - Suspense対応 */}
        <Suspense fallback={<StatisticsSkeleton />}>
          <StatisticsSection />
        </Suspense>

        {/* カテゴリー一覧 - Suspense対応 */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>

        {/* 機能紹介 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            学習機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  フラッシュカード
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  カードをめくって単語を学習。音声機能付きで発音も学べます。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  クイズ
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  選択問題で理解度を確認。間違えた問題は復習リストに自動追加。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  復習システム
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  忘却曲線に基づく効率的な復習で、長期記憶に定着させます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            今すぐ英語学習を始めましょう
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            無料でアカウントを作成して、効率的な英語学習を体験してください。
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-12 py-4">
              無料で始める
            </Button>
          </Link>
        </div>
    </LandingLayout>
  );
} 