import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { Header } from '@/components/common';
import dynamic from 'next/dynamic';
import { CategoryCardSkeleton, StatsCardSkeleton } from '@/components/ui/skeleton';
import { Play, RotateCcw, BookOpen, Brain, Target } from 'lucide-react';
import Link from 'next/link';

// 動的インポートでバンドルサイズを最適化
const StatisticsDashboard = dynamic(() => import('@/components/learning/statistics-dashboard').then(mod => ({ default: mod.StatisticsDashboard })), {
  loading: () => <StatisticsSkeleton />,
  ssr: true
});

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

// 静的生成の最適化
export async function generateStaticParams() {
  return [{}]; // 単一ページの静的生成
}

// プライマリアクションセクション
function PrimaryActionsSection() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            学習を始める
          </h2>
          <p className="text-muted-foreground">
            効率的な学習で英語力を向上させましょう
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 学習開始カード */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/8 to-primary/10 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <Link href="/dashboard/start-learning" className="block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-primary/15 rounded-2xl group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300">
                    <Play className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xl font-bold text-foreground">
                      学習開始
                    </span>
                    <p className="text-sm text-muted-foreground">
                      新しい単語を効率的に学習
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  推奨
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  フラッシュカードとクイズを組み合わせた効果的な学習システムで、新しい単語を確実に身につけましょう。
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <BookOpen className="h-3.5 w-3.5" />
                      フラッシュカード
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <Brain className="h-3.5 w-3.5" />
                      クイズ
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">44</div>
                    <div className="text-xs text-muted-foreground">学習可能な単語</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* 復習カード */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/5 via-emerald-600/8 to-emerald-700/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <Link href="/dashboard/review" className="block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-emerald-500/15 rounded-2xl group-hover:bg-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                    <RotateCcw className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xl font-bold text-foreground">
                      復習
                    </span>
                    <p className="text-sm text-muted-foreground">
                      間隔反復で確実に定着
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                  復習
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  忘却曲線に基づく科学的な間隔反復システムで、学習した単語を長期的に記憶に定着させます。
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
                      <RotateCcw className="h-3.5 w-3.5" />
                      間隔反復
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
                      <Target className="h-3.5 w-3.5" />
                      定着確認
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">0</div>
                    <div className="text-xs text-muted-foreground">復習待ち単語</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </section>
  );
}

// 非同期でカテゴリーデータを取得するコンポーネント
async function CategoriesSection() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          カテゴリーを選択
        </h2>
        <p className="text-muted-foreground">
          学習したい単語の種類を選んでください
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staticData.categories.map((category) => (
          <Link 
            key={category.name}
            href={`/dashboard/category/${encodeURIComponent(category.name)}`}
          >
            <Card className="group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:scale-105 border-border hover:border-primary/20 touch-friendly">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {category.englishName}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                    {category.pos}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {category.count}個の単語
                  </p>
                  <div className="w-2 h-2 bg-primary/30 rounded-full group-hover:bg-primary transition-colors"></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

// 統計ダッシュボードのスケルトン
function StatisticsSkeleton() {
  return (
    <section className="mb-12">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// カテゴリーセクションのスケルトン
function CategoriesSkeleton() {
  return (
    <section className="mb-12">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default function ProtectedPage() {
  return (
    <AuthWrapper>
      {/* ヘッダー */}
      <Header 
        title="ダッシュボード"
        showUserInfo={true}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* プライマリアクション - 最上部に配置 */}
        <PrimaryActionsSection />

        {/* 統計ダッシュボード - Suspense対応 */}
        <Suspense fallback={<StatisticsSkeleton />}>
          <StatisticsDashboard />
        </Suspense>

        {/* カテゴリー選択 - Suspense対応 */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
      </main>
    </AuthWrapper>
  );
}
