'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { DatabaseService } from '@/lib/database';
import { Word, ReviewWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Check, X, Clock, Star, BookOpen } from 'lucide-react';
import { AudioControls } from '@/components/common/audio-controls';
import { Badge } from '@/components/ui/badge';

interface ReviewProps {
  onComplete: (results: { wordId: string; correct: boolean; difficulty: number }[]) => void;
}

export function Review({ onComplete }: ReviewProps) {
  const { user } = useAuth();
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ wordId: string; correct: boolean; difficulty: number }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const currentWord = words[currentIndex];
  const currentReviewWord = reviewWords[currentIndex];
  const db = useMemo(() => new DatabaseService(), []);

  // セッション時間の計算
  const sessionDuration = useMemo(() => {
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
  }, [sessionStartTime]);

  // 進捗統計
  const progressStats = useMemo(() => {
    const correctCount = results.filter(r => r.correct).length;
    const totalAnswered = results.length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const averageDifficulty = totalAnswered > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.difficulty, 0) / totalAnswered * 10) / 10 
      : 0;

    return {
      correctCount,
      totalAnswered,
      accuracy,
      averageDifficulty,
      remainingWords: words.length - totalAnswered
    };
  }, [results, words.length]);

  const loadReviewWords = useCallback(async () => {
    if (!user) return;
    
    try {
      const dueWords = await db.getDueReviewWords(user.id);
      setReviewWords(dueWords);

      if (dueWords.length > 0) {
        // 復習対象の単語データを取得
        const wordIds = dueWords.map(rw => rw.word_id);
        const allWords = await db.getWords();
        const filteredWords = allWords.filter(word => wordIds.includes(word.id));
        setWords(filteredWords);
      }
    } catch (error) {
      console.error('復習単語の読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, db]);

  const initializeSession = useCallback(async () => {
    if (!user) return;
    
    try {
      if (!sessionId) {
        const newSessionId = await db.createReviewSession({
          user_id: user.id,
          total_words: words.length,
          completed_words: 0,
          correct_answers: 0,
          start_time: new Date().toISOString(),
          end_time: null
        });
        setSessionId(newSessionId);
        setSessionStartTime(new Date());
      }
    } catch (error) {
      console.error('復習セッション初期化エラー:', error);
    }
  }, [sessionId, words.length, user, db]);

  useEffect(() => {
    loadReviewWords();
  }, [loadReviewWords]);

  useEffect(() => {
    if (reviewWords.length > 0 && words.length > 0) {
      initializeSession();
    }
  }, [reviewWords, words, initializeSession]);

  const handleAnswer = async (correct: boolean, difficulty: number) => {
    if (!currentWord || !currentReviewWord) return;

    const result = {
      wordId: currentWord.id,
      correct,
      difficulty
    };

    setResults(prev => [...prev, result]);

    try {
      if (user) {
        // 復習結果を更新
        const newReviewCount = (currentReviewWord.review_count || 0) + 1;
        const nextReview = db.calculateNextReview(difficulty, newReviewCount);

        await db.updateReviewWord(user.id, currentWord.id, {
          review_count: newReviewCount,
          last_reviewed: new Date().toISOString(),
          next_review: nextReview.toISOString(),
          difficulty_level: difficulty
        });

        // セッション進捗を更新
        if (sessionId) {
          const currentResults = [...results, result];
          await db.updateReviewSession(sessionId, {
            completed_words: currentResults.length,
            correct_answers: currentResults.filter(r => r.correct).length
          });
        }
      }
    } catch (error) {
      console.error('復習結果の保存エラー:', error);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    try {
      if (sessionId) {
        await db.updateReviewSession(sessionId, {
          completed_words: words.length,
          end_time: new Date().toISOString()
        });
      }
      onComplete(results);
    } catch (error) {
      console.error('復習セッション完了エラー:', error);
      onComplete(results);
    }
  };

  const playWordAudio = () => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'ja-JP'; // 日本語の発音を指定
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-2 sm:px-3 lg:px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              復習単語を読み込み中...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-2 sm:px-3 lg:px-4">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3">
              復習予定の単語はありません
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 lg:mb-6">
              復習リストに追加した単語は、間隔反復アルゴリズムに基づいて適切なタイミングで表示されます。
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                新しい単語を学習すると、自動的に復習リストに追加されます。
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
            {/* 進捗表示と統計 */}
            <div className="flex-shrink-0 space-y-4">
              {/* シンプルな進捗表示 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-foreground">
                    復習 {currentIndex + 1} / {words.length}
                  </span>
                  <Badge variant="secondary" className="text-sm">
                    {progressStats.accuracy}% 正答率
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(sessionDuration)}
                  </div>
                  <AudioControls />
                </div>
              </div>
              
              {/* シンプルなプログレスバー */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                />
              </div>

              {/* シンプルな統計表示 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {progressStats.correctCount}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">正解</div>
                </div>
                
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {progressStats.totalAnswered - progressStats.correctCount}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">不正解</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {progressStats.remainingWords}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">残り</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {progressStats.averageDifficulty}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">平均難易度</div>
                </div>
              </div>
            </div>

            {/* シンプルな復習カード */}
            <div className="flex-1 min-h-0">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center space-y-8">
                  {/* 単語表示 */}
                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
                      {currentWord.word}
                    </h2>
                    <p className="text-xl sm:text-2xl text-muted-foreground">
                      {currentWord.phonetic}
                    </p>
                  </div>
                  
                  {/* 操作ボタン */}
                  <div className="space-y-6">
                    {/* 発音ボタン */}
                    <Button
                      variant="outline"
                      onClick={playWordAudio}
                      className="w-full max-w-xs bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30 py-3"
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      発音を聞く
                    </Button>

                    {/* 答えを見るボタン */}
                    {!showAnswer && (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        className="w-full max-w-xs bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white py-4 text-lg"
                      >
                        答えを見る
                      </Button>
                    )}

                    {/* 答え表示 */}
                    {showAnswer && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                            {currentWord.japanese}
                          </h3>
                          {currentWord.example1_jp && (
                            <p className="text-green-600 dark:text-green-300">
                              {currentWord.example1_jp}
                            </p>
                          )}
                        </div>

                        {/* シンプルな評価ボタン */}
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            この単語を覚えていますか？
                          </p>
                          <div className="flex gap-4 justify-center">
                            <Button
                              variant="outline"
                              onClick={() => handleAnswer(false, 1)}
                              className="flex-1 max-w-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20 py-3"
                            >
                              <X className="h-5 w-5 mr-2" />
                              覚えていない
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleAnswer(true, 3)}
                              className="flex-1 max-w-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 py-3"
                            >
                              <Check className="h-5 w-5 mr-2" />
                              覚えている
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* シンプルな復習情報 */}
            {currentReviewWord && (
              <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-muted-foreground flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    復習回数: {currentReviewWord.review_count}回
                  </div>
                  {currentReviewWord.last_reviewed && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      前回復習: {new Date(currentReviewWord.last_reviewed).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 