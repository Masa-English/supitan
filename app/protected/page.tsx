'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { AppStats, Category } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Trophy, Clock, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';

export default function ProtectedPage() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

  const loadData = useCallback(async (userId: string) => {
    try {
      const [statsData, categoriesData] = await Promise.all([
        db.getAppStats(userId),
        db.getCategories()
      ]);

      setStats(statsData);
      setCategories(categoriesData.map(cat => ({
        name: cat.category,
        count: cat.count,
        pos: getPosSymbol(cat.category)
      })));
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const getPosSymbol = (category: string): string => {
    const posMap: Record<string, string> = {
      '動詞': 'V',
      '形容詞': 'Adj',
      '副詞': 'Adv',
      '名詞': 'N'
    };
    return posMap[category] || '';
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      await loadData(user.id);
    };

    getUser();
  }, [loadData, router, supabase.auth]);

  const handleCategorySelect = (category: string) => {
    router.push(`/protected/category/${encodeURIComponent(category)}`);
  };

  const handleReviewSelect = () => {
    router.push('/protected/review');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700 dark:text-amber-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <Header 
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        {stats && (
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
                  {stats.total_words}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  学習済み
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.studied_words}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  習得済み
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.mastered_words}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  学習時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.study_time_minutes}分
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  復習待ち
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.review_count}
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
            {categories.map((category) => (
              <Card 
                key={category.name}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700"
                onClick={() => handleCategorySelect(category.name)}
              >
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
            ))}

            {/* 復習カード */}
            <Card 
              className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-orange-200 dark:border-orange-700"
              onClick={handleReviewSelect}
            >
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
                  {stats?.review_count || 0}個の単語
                </p>
                <p className="text-sm text-orange-500 dark:text-orange-300 mt-1">
                  やり直しに追加した単語を復習
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
