'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy, Target, Star } from 'lucide-react';
import { Header } from '@/components/common';

// 動的インポートでバンドルサイズを最適化
const Review = dynamic(() => import('@/components/learning/review').then(mod => ({ default: mod.Review })), {
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function ReviewPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean; difficulty: number }[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router, supabase.auth]);

  const handleComplete = (reviewResults: { wordId: string; correct: boolean; difficulty: number }[]) => {
    setResults(reviewResults);
    setIsCompleted(true);
  };

  const handleBackToHome = () => {
    router.push('/dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/landing');
  };

  const handleStartNewReview = () => {
    // ページをリロードして完全にリセット
    window.location.reload();
  };

  const getPerformanceMessage = () => {
    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    if (accuracy >= 90) return { emoji: "🎉", message: "素晴らしい！", color: "text-green-600" };
    if (accuracy >= 70) return { emoji: "👏", message: "よくできました！", color: "text-primary" };
    if (accuracy >= 50) return { emoji: "👍", message: "がんばりました！", color: "text-primary" };
    return { emoji: "💪", message: "次回もがんばりましょう！", color: "text-orange-600" };
  };

  if (isCompleted) {
    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const averageDifficulty = totalCount > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.difficulty, 0) / totalCount * 10) / 10 
      : 0;
    const performance = getPerformanceMessage();

    return (
      <div className="h-screen flex flex-col">
        <Header
          title="復習完了"
          showBackButton={false}
          userEmail={user?.email}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{performance.emoji}</div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                復習完了！
              </h2>
              <p className={`text-base sm:text-lg font-semibold mb-2 ${performance.color}`}>
                {performance.message}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                {totalCount}個の単語を復習しました
              </p>
            </div>

            {/* 結果カード */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700 text-center">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                      {correctCount}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                      正解
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {totalCount}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      総問題
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-700 text-center">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                    <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                      {accuracy}%
                    </div>
                    <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      正答率
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-700 text-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                      {averageDifficulty}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                      平均難易度
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleStartNewReview}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                新しい復習を開始
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="flex-1"
              >
                ダッシュボードに戻る
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        title="復習"
        showBackButton={true}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Review
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
} 