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
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-6">
        カテゴリーを選択
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staticData.categories.map((category) => (
          <Link 
            key={category.name}
            href={`/protected/category/${encodeURIComponent(category.name)}`}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                      {category.name}
                    </span>
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      {category.englishName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    {category.pos}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  {category.count}個の単語
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* 復習カード */}
        <Link href="/protected/review">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-orange-200 dark:border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                  復習
                </span>
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  復習
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 dark:text-orange-400">
                復習待ちの単語を学習
              </p>
              <p className="text-sm text-orange-500 dark:text-orange-300 mt-1">
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
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div className="mb-8">
      <div className="h-8 w-64 bg-amber-200 dark:bg-amber-700 rounded mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計ダッシュボード - Suspense対応 */}
        <Suspense fallback={<StatisticsSkeleton />}>
          <div className="mb-8">
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
