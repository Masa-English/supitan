import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { Header } from '@/components/common';
import dynamic from 'next/dynamic';
import { CategoryCardSkeleton, StatsCardSkeleton } from '@/components/ui/skeleton';

// 動的インポートでバンドルサイズを最適化
const StatisticsDashboard = dynamic(() => import('@/components/learning/statistics-dashboard').then(mod => ({ default: mod.StatisticsDashboard })), {
  loading: () => <StatisticsSkeleton />,
  ssr: true
});
import Link from 'next/link';

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

// 静的生成の最適化
export async function generateStaticParams() {
  return [{}]; // 単一ページの静的生成
}

// 非同期でカテゴリーデータを取得するコンポーネント
async function CategoriesSection() {
  const { getStaticData } = await import('@/lib/static-data');
  const staticData = await getStaticData();

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
        カテゴリーを選択
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {staticData.categories.map((category) => (
          <Link 
            key={category.name}
            href={`/dashboard/category/${encodeURIComponent(category.name)}`}
          >
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-primary/20">
              <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      {category.name}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {category.englishName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    {category.pos}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {category.count}個の単語
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* 復習カード */}
        <Link href="/dashboard/review">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-primary/20">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-foreground">
                  復習
                </span>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  復習
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                復習待ちの単語を学習
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                間隔反復アルゴリズムで効率的に復習
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// 統計ダッシュボードのスケルトン
function StatisticsSkeleton() {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// カテゴリーセクションのスケルトン
function CategoriesSkeleton() {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="h-6 sm:h-8 w-48 sm:w-64 bg-muted rounded mb-4 sm:mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 統計ダッシュボード - Suspense対応 */}
        <Suspense fallback={<StatisticsSkeleton />}>
          <div className="mb-6 sm:mb-8">
            <StatisticsDashboard />
          </div>
        </Suspense>

        {/* カテゴリー選択 - Suspense対応 */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
      </main>
    </AuthWrapper>
  );
}
