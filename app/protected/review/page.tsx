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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    router.push('/protected');
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

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{performance.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              復習完了！
            </h2>
            <p className={`text-lg font-semibold mb-2 ${performance.color}`}>
              {performance.message}
            </p>
            <p className="text-muted-foreground text-sm">
              お疲れさまでした。復習結果を確認してください。
            </p>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {correctCount}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  正解数
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent border-border">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {totalCount}
                </div>
                <div className="text-xs text-primary font-medium">
                  総問題数
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent border-border">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {accuracy}%
                </div>
                <div className="text-xs text-primary font-medium">
                  正答率
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 bg-card/90 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <h3 className="text-base font-semibold text-foreground mb-3">
                詳細結果
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">正解数:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {correctCount} / {totalCount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">平均難易度:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {averageDifficulty} / 5
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">学習進捗</span>
                    <span className="text-xs font-medium text-primary">{accuracy}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              ホームに戻る
            </Button>
            
            <Button
              onClick={handleStartNewReview}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              新しい復習を開始
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
        title="復習モード"
        showBackButton={false}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0">
        <div className="text-center mb-6 max-w-4xl mx-auto">
          <Clock className="h-12 w-12 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            復習モード
          </h2>
          <p className="text-muted-foreground text-sm">
            間隔反復アルゴリズムに基づいて、最適なタイミングで復習を行います。
          </p>
        </div>

        <Review onComplete={handleComplete} />
      </main>
    </div>
  );
} 