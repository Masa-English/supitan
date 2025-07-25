import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Clock, RotateCcw } from 'lucide-react';
import { StatsCardSkeleton, CategoryCardSkeleton } from '@/components/ui/skeleton';
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
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            総単語数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {staticData.totalWords}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Target className="h-4 w-4" />
            カテゴリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {staticData.categories.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            学習モード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            3
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            最終更新
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            {new Date(staticData.lastUpdated).toLocaleDateString('ja-JP')}
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
      <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-8 text-center">
        学習カテゴリー
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {staticData.categories.map((category) => (
          <Card key={category.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Badge variant="outline" className="text-lg font-bold border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                  {category.pos}
                </Badge>
              </div>
              <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                {category.count}個の単語
              </p>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
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
      <div className="h-8 w-64 bg-amber-200 dark:bg-amber-700 rounded mx-auto mb-8 animate-pulse"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              Masa Flash
            </h1>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            効率的な英語学習を始めましょう
          </h2>
          <p className="text-xl text-amber-700 dark:text-amber-300 mb-8">
            単語数読み込み中...個の単語で、あなたの英語力を向上させます
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-3">
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
          <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-8 text-center">
            学習機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
                  フラッシュカード
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-700 dark:text-blue-300">
                  カードをめくって単語を学習。音声機能付きで発音も学べます。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-green-800 dark:text-green-200">
                  クイズ
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-700 dark:text-green-300">
                  選択問題で理解度を確認。間違えた問題は復習リストに自動追加。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl text-purple-800 dark:text-purple-200">
                  復習システム
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 dark:text-purple-300">
                  忘却曲線に基づく効率的な復習で、長期記憶に定着させます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            今すぐ英語学習を始めましょう
          </h2>
          <p className="text-lg text-amber-700 dark:text-amber-300 mb-8">
            無料でアカウントを作成して、効率的な英語学習を体験してください。
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-12 py-4">
              無料で始める
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
} 