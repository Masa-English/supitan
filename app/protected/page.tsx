import { getStaticData } from '@/lib/static-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { AuthWrapper } from '@/components/auth-wrapper';
import { StatisticsDashboard } from '@/components/statistics-dashboard';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// 静的生成の設定
export const revalidate = 3600; // 1時間ごとに再生成

export default async function ProtectedPage() {
  // サーバーサイドでデータを取得
  const staticData = await getStaticData();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  


  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 統計ダッシュボード */}
          {user ? (
            <div className="mb-8">
              <StatisticsDashboard userId={user.id} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            </div>
          )}

          {/* カテゴリー選択 */}
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
                        <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                          {category.name}
                        </span>
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
        </main>
      </div>
    </AuthWrapper>
  );
}
