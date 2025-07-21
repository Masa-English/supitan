'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Flashcard } from '@/components/flashcard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Home } from 'lucide-react';
import { Header } from '@/components/header';

export default function FlashcardPage() {
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

  const loadData = useCallback(async () => {
    try {
      const wordsData = await db.getWordsByCategory(category);
      setWords(wordsData);
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
      await loadData();
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
        mode: 'flashcard',
        total_words: words.length,
        completed_words: words.length,
        correct_answers: results.filter(r => r.correct).length,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });
    } catch (error) {
      console.error('学習セッションの保存に失敗しました:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;

    try {
      // 復習リストに追加する処理（実装予定）
      console.log('復習リストに追加:', wordId);
    } catch (error) {
      console.error('復習リストへの追加に失敗しました:', error);
    }
  };

  const handleRetry = () => {
    setSessionComplete(false);
    setSessionResults([]);
  };

  const handleBackToCategory = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}`);
  };

  const handleBackToHome = () => {
    router.push('/protected');
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

  if (sessionComplete) {
    const correctCount = sessionResults.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / sessionResults.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <Header 
          title="学習完了"
          showBackButton={true}
          onBackClick={handleBackToCategory}
          showUserInfo={false}
        />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-amber-800 dark:text-amber-200">
                お疲れさまでした！
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  {category}の学習が完了しました
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  {words.length}個の単語を学習しました
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
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    正答率
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  もう一度
                </Button>
                <Button
                  onClick={handleBackToCategory}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  カテゴリーに戻る
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mt-4 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <Header 
        title={`${category} - フラッシュカード`}
        showBackButton={true}
        onBackClick={handleBackToCategory}
        showUserInfo={false}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Flashcard
          words={words}
          onComplete={handleComplete}
          onAddToReview={handleAddToReview}
          category={category}
        />
      </main>
    </div>
  );
} 