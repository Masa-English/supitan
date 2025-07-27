'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/common';
import { 
  ArrowLeft, 
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

// カテゴリーカードコンポーネント
function CategoryCard({ 
  category, 
  wordCount, 
  userProgress 
}: { 
  category: string; 
  wordCount: number; 
  userProgress: number; 
}) {
  const progressPercentage = wordCount > 0 ? Math.round((userProgress / wordCount) * 100) : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:scale-105">
      <Link href={`/dashboard/category/${encodeURIComponent(category)}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* カテゴリー名 */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                {category}
              </h3>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {wordCount}個の単語
              </Badge>
            </div>

            {/* 進捗情報 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-amber-600 dark:text-amber-400">
                <span>学習進捗</span>
                <span>{userProgress} / {wordCount}</span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-2">
                <div
                  className="bg-amber-600 dark:bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {progressPercentage}% 完了
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                学習開始
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function CategoryPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const db = useMemo(() => new DatabaseService(), []);
  const supabase = createClient();

  // データの読み込み
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // 単語データとユーザー進捗を取得
      const [wordsData, userProgressData] = await Promise.all([
        db.getWords(),
        db.getUserProgress(user.id)
      ]);

      setWords(wordsData);

      // カテゴリー別の進捗を計算
      const progressMap: Record<string, number> = {};
      const categoryMap: Record<string, number> = {};

      // カテゴリー別の単語数を計算
      wordsData.forEach(word => {
        categoryMap[word.category] = (categoryMap[word.category] || 0) + 1;
      });

      // カテゴリー別の学習済み単語数を計算
      userProgressData.forEach(progress => {
        if (progress.word_id) {
          const word = wordsData.find(w => w.id === progress.word_id);
          if (word && (progress.study_count || 0) > 0) {
            progressMap[word.category] = (progressMap[word.category] || 0) + 1;
          }
        }
      });

      setUserProgress(progressMap);
    } catch (err) {
      console.error('Category page error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [db, supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // カテゴリー別の統計を計算
  const categoryStats = useMemo(() => {
    const categoryMap: Record<string, { count: number; progress: number }> = {};
    
    words.forEach(word => {
      if (!categoryMap[word.category]) {
        categoryMap[word.category] = { count: 0, progress: 0 };
      }
      categoryMap[word.category].count += 1;
    });

    // 進捗情報を追加
    Object.keys(categoryMap).forEach(category => {
      categoryMap[category].progress = userProgress[category] || 0;
    });

    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      wordCount: stats.count,
      userProgress: stats.progress
    }));
  }, [words, userProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <Header 
          title="カテゴリー一覧"
          showBackButton={true}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-amber-700 dark:text-amber-300">カテゴリーを読み込み中...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <Header 
          title="カテゴリー一覧"
          showBackButton={true}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-amber-600 hover:bg-amber-700">
              再試行
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <Header 
        title="カテゴリー一覧"
        showBackButton={true}
      />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-amber-600" />
                カテゴリー一覧
              </h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {categoryStats.length}個のカテゴリー
              </Badge>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {words.length}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      総単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {categoryStats.length}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      カテゴリー数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {Object.values(userProgress).reduce((sum, count) => sum + count, 0)}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      学習済み単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {Math.round(
                        (Object.values(userProgress).reduce((sum, count) => sum + count, 0) / Math.max(words.length, 1)) * 100
                      )}%
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      全体進捗
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* カテゴリー一覧 */}
          {categoryStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryStats.map(({ category, wordCount, userProgress }) => (
                <CategoryCard
                  key={category}
                  category={category}
                  wordCount={wordCount}
                  userProgress={userProgress}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                カテゴリーが見つかりませんでした
              </h3>
              <p className="text-amber-600 dark:text-amber-400 mb-4">
                単語データが読み込まれていない可能性があります
              </p>
              <Button onClick={loadData} className="bg-amber-600 hover:bg-amber-700">
                再読み込み
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 