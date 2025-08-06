'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { 
  getAllCategories, 
  createAllCategoryStats, 
  encodeCategoryName,
  CategoryStats 
} from '@/lib/categories';

// カテゴリーカードコンポーネント
function CategoryCard({ 
  categoryStats 
}: { 
  categoryStats: CategoryStats;
}) {
  const progressPercentage = categoryStats.count > 0 ? 
    Math.round(((categoryStats.progress || 0) / categoryStats.count) * 100) : 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card">
      <Link href={`/dashboard/category/${encodeCategoryName(categoryStats.name)}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* カテゴリー名 */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{categoryStats.icon}</span>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                  {categoryStats.pos}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {categoryStats.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {categoryStats.englishName}
              </p>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                {categoryStats.count}個の単語
              </Badge>
            </div>

            {/* 進捗情報 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>学習進捗</span>
                <span>{categoryStats.progress || 0} / {categoryStats.count}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: categoryStats.color
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {progressPercentage}% 完了
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
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

      // ユーザー情報を取得（エラーハンドリング付き）
      let user = null;
      try {
        const { data: { user: userData }, error } = await supabase.auth.getUser();
        if (!error && userData) {
          user = userData;
        }
             } catch {
         // セッションエラーは静かに処理
         console.debug('Session check skipped for category page');
         router.push('/auth/login');
         return;
       }
      
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

  // カテゴリー別の統計を計算（新しいユーティリティ関数を使用）
  const categoryStats = useMemo(() => {
    return createAllCategoryStats(
      words.reduce((acc, word) => {
        acc[word.category] = (acc[word.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      userProgress
    );
  }, [words, userProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">カテゴリーを読み込み中...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadData} className="bg-primary hover:bg-primary/90">
              再試行
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:bg-muted mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                カテゴリー一覧
              </h1>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                {categoryStats.length}個のカテゴリー
              </Badge>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {words.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      総単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {categoryStats.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      カテゴリー数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {Object.values(userProgress).reduce((sum, count) => sum + count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      学習済み単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(
                        (Object.values(userProgress).reduce((sum, count) => sum + count, 0) / Math.max(words.length, 1)) * 100
                      )}%
                    </div>
                    <div className="text-sm text-muted-foreground">
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
              {categoryStats.map((categoryStats) => (
                <CategoryCard
                  key={categoryStats.name}
                  categoryStats={categoryStats}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                カテゴリーが見つかりませんでした
              </h3>
              <p className="text-muted-foreground mb-4">
                単語データが読み込まれていない可能性があります
              </p>
              <Button onClick={loadData} className="bg-primary hover:bg-primary/90">
                再読み込み
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 