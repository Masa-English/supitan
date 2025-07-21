'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Play, BookOpen, Brain } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

  const loadReviewWords = useCallback(async (userId: string) => {
    try {
      const reviewData = await db.getReviewWords(userId);
      
      // 復習リストの単語IDから実際の単語データを取得
      const wordIds = reviewData.map(r => r.word_id);
      const allWords = await db.getWords();
      const words = allWords.filter(word => wordIds.includes(word.id));
      
      setReviewWords(words);
    } catch (error) {
      console.error('復習単語の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      await loadReviewWords(user.id);
    };

    getUser();
  }, [loadReviewWords, router, supabase.auth]);

  const handleStartFlashcard = () => {
    router.push('/protected/review/flashcard');
  };

  const handleStartQuiz = () => {
    router.push('/protected/review/quiz');
  };

  const handleBackToHome = () => {
    router.push('/protected');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="h-6 w-6 text-orange-600" />
              復習
            </h1>
            <Badge variant="secondary" className="ml-4">
              {reviewWords.length}個の単語
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reviewWords.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                復習する単語がありません
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                学習中に「復習に追加」した単語がここに表示されます
              </p>
              <Button onClick={handleBackToHome}>
                ホームに戻る
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 学習モード選択 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                復習モードを選択
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* フラッシュカード */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      フラッシュカード
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      カードをめくって復習します。日本語→英語の順で表示されます。
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={handleStartFlashcard}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      開始
                    </Button>
                  </CardContent>
                </Card>

                {/* クイズ */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-green-600" />
                      クイズ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      4択クイズで理解度を確認します。正解音・不正解音付き。
                    </p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleStartQuiz}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      開始
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 復習単語一覧 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                復習単語一覧
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewWords.map((word) => (
                  <Card key={word.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {word.word}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {word.phonetic}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {word.japanese}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {word.category}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 