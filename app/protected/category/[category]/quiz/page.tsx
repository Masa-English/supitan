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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { mastery_level: number; is_favorite: boolean }>>({});
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
      setUserProgress(progressMap);
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
          // 既存の進捗を取得（お気に入り状態の保持のため）
          const existingProgress = await db.getWordProgress(user.id, result.wordId);
          
          // 新しい進捗値を計算
          const studyCount = (existingProgress?.study_count || 0) + 1;
          const correctCount = (existingProgress?.correct_count || 0) + (result.correct ? 1 : 0);
          const incorrectCount = (existingProgress?.incorrect_count || 0) + (result.correct ? 0 : 1);
          
          // マスタリーレベルの計算（簡易版）
          const masteryLevel = Math.min(1, (correctCount / studyCount) * 0.8 + (studyCount * 0.1));

          console.log('Updating quiz progress for word:', {
            wordId: result.wordId,
            userId: user.id,
            studyCount,
            correctCount,
            incorrectCount,
            masteryLevel,
            isCorrect: result.correct,
            existingProgress: existingProgress ? 'exists' : 'new'
          });

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

          console.log(`クイズ結果 ${result.wordId} の進捗更新が完了しました`);
        } catch (error) {
          console.error(`クイズ結果 ${result.wordId} の進捗更新に失敗しました:`, {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
          });
        }
      }
    } catch (error) {
      console.error('セッション結果の保存に失敗しました:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;

    try {
      await db.addToReview(user.id, wordId);
      console.log('復習リストに追加しました');
    } catch (error) {
      console.error('復習リストへの追加に失敗しました:', error);
    }
  };

  const handleRetry = () => {
    // ページをリロードして完全にリセット
    window.location.reload();
  };

  const handleBackToCategory = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}`);
  };

  const handleBackToHome = () => {
    router.push('/protected');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCount = sessionResults.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / sessionResults.length) * 100);

    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="クイズ完了"
          showBackButton={true}
          onBackClick={handleBackToCategory}
          showUserInfo={false}
        />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">
                クイズ完了！
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {category}のクイズが完了しました
                </h3>
                <p className="text-muted-foreground">
                  {sessionResults.length}問に挑戦しました
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {correctCount}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    正解
                  </div>
                </div>
                <div className="bg-accent p-4 rounded-lg border border-border">
                  <div className="text-2xl font-bold text-primary">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-primary">
                    正答率
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 border-border text-foreground hover:bg-accent"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  もう一度
                </Button>
                <Button
                  onClick={handleBackToCategory}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  カテゴリーに戻る
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mt-4 text-primary hover:bg-accent"
              >
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header 
        title={`${category} - クイズ`}
        showBackButton={true}
        onBackClick={handleBackToCategory}
        showUserInfo={false}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0">
        <Quiz
          words={words}
          onComplete={handleComplete}
          onAddToReview={handleAddToReview}
        />
      </main>
    </div>
  );
} 