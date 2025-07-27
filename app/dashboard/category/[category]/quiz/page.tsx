'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Home } from 'lucide-react';
import { Header } from '@/components/common';

// 動的インポートでバンドルサイズを最適化
const Quiz = dynamic(() => import('@/components/learning').then(mod => ({ default: mod.Quiz })), {
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);

  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);

  const loadData = useCallback(async (userId: string) => {
    try {
      const [wordsData, progressData] = await Promise.all([
        db.getWordsByCategory(category),
        db.getUserProgress(userId)
      ]);

      setWords(wordsData);
      
      // プログレスデータをマップ形式に変換
      const progressMap: Record<string, { mastery_level: number; is_favorite: boolean }> = {};
      progressData.forEach(progress => {
        if (progress.word_id) {
          progressMap[progress.word_id] = {
            mastery_level: progress.mastery_level || 0,
            is_favorite: progress.is_favorite || false
          };
        }
      });

    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db]);

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

  const handleComplete = async (results: { wordId: string; correct: boolean }[]) => {
    if (!user) return;

    setSessionResults(results);
    setSessionComplete(true);

    // 結果をデータベースに保存
    try {
      await db.createStudySession({
        user_id: user.id,
        category,
        mode: 'quiz',
        total_words: results.length,
        completed_words: results.length,
        correct_answers: results.filter(r => r.correct).length,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });

      // 各単語のプログレスを更新
      for (const result of results) {
        try {
          const existingProgress = await db.getWordProgress(user.id, result.wordId);
          
          const studyCount = (existingProgress?.study_count || 0) + 1;
          const correctCount = (existingProgress?.correct_count || 0) + (result.correct ? 1 : 0);
          const incorrectCount = (existingProgress?.incorrect_count || 0) + (result.correct ? 0 : 1);
          
          // マスタリーレベルの計算
          const masteryLevel = Math.min(1, (correctCount / Math.max(studyCount, 1)) * 0.8 + (studyCount * 0.1));

          await db.upsertProgress({
            user_id: user.id,
            word_id: result.wordId,
            mastery_level: masteryLevel,
            study_count: studyCount,
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            is_favorite: existingProgress?.is_favorite || false,
            last_studied: new Date().toISOString()
          });

          // 間違えた問題は復習リストに追加
          if (!result.correct) {
            await db.addToReview(user.id, result.wordId);
          }
        } catch (error) {
          console.error(`単語 ${result.wordId} の進捗更新エラー:`, error);
        }
      }
    } catch (error) {
      console.error('学習セッションの保存エラー:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;

    try {
      await db.addToReview(user.id, wordId);
    } catch (error) {
      console.error('復習リストへの追加エラー:', error);
    }
  };

  const handleRetry = () => {
    setSessionComplete(false);
    setSessionResults([]);
    window.location.reload();
  };

  const handleBackToHome = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header
          title={`${category} - クイズ`}
          showBackButton={true}
          userEmail={user?.email}
        />
        
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {category}のクイズデータを読み込み中...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <Header
          title={`${category} - クイズ`}
          showBackButton={true}
          userEmail={user?.email}
        />
        
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <div className="text-primary text-2xl sm:text-3xl">🧠</div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              単語が見つかりません
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {category}カテゴリーに単語が登録されていないか、データの読み込みに失敗しました。
            </p>
            <button
              onClick={handleBackToHome}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCount = sessionResults.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / sessionResults.length) * 100);

    return (
      <div className="h-screen flex flex-col">
        <Header
          title={`${category} - クイズ完了`}
          showBackButton={true}
          userEmail={user?.email}
        />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                  クイズ完了！
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 結果表示 */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {correctCount}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                      正解
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {sessionResults.length}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      総問題
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-700 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {accuracy}%
                    </div>
                    <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      正答率
                    </div>
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={handleRetry}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    もう一度挑戦
                  </Button>
                  <Button
                    onClick={handleBackToHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    ダッシュボードに戻る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        title={`${category} - クイズ`}
        showBackButton={true}
        userEmail={user?.email}
      />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Quiz
          words={words}
          onComplete={handleComplete}
          onAddToReview={handleAddToReview}
        />
      </main>
    </div>
  );
} 