'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, ReviewWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Check, X, Clock, Star, Target, TrendingUp, Timer } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/common/audio-controls';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ReviewProps {
  onComplete: (results: { wordId: string; correct: boolean; difficulty: number }[]) => void;
}

export function Review({ onComplete }: ReviewProps) {
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ wordId: string; correct: boolean; difficulty: number }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentWord = words[currentIndex];
  const currentReviewWord = reviewWords[currentIndex];
  const supabase = createClient();
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const dueWords = await db.getDueReviewWords(user.id);
        setReviewWords(dueWords);

        if (dueWords.length > 0) {
          // 復習対象の単語データを取得
          const wordIds = dueWords.map(rw => rw.word_id);
          const allWords = await db.getWords();
          const filteredWords = allWords.filter(word => wordIds.includes(word.id));
          setWords(filteredWords);
        }
      }
    } catch (error) {
      console.error('復習単語の読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, db]);

  const initializeSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !sessionId) {
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
  }, [sessionId, words.length, supabase, db]);

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
      const { data: { user } } = await supabase.auth.getUser();
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
      setShowHint(false);
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">復習単語を読み込み中...</p>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Clock className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          復習予定の単語はありません
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          復習リストに追加した単語は、間隔反復アルゴリズムに基づいて適切なタイミングで表示されます。
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 新しい単語を学習すると、自動的に復習リストに追加されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 進捗表示と統計 */}
      <div className="mb-6 flex-shrink-0">
        {/* メイン進捗バー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              復習 {currentIndex + 1} / {words.length}
            </span>
            <Badge variant="secondary" className="text-xs">
              {progressStats.accuracy}% 正答率
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Timer className="h-4 w-4" />
              {formatTime(sessionDuration)}
            </div>
            <AudioControls />
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-3 text-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {progressStats.correctCount}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">正解</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
            <CardContent className="p-3 text-center">
              <X className="h-4 w-4 text-red-600 dark:text-red-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {progressStats.totalAnswered - progressStats.correctCount}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">不正解</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {progressStats.remainingWords}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">残り</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {progressStats.averageDifficulty}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">平均難易度</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 復習カード */}
      <div className="flex-1 min-h-0 mb-4">
        <Card className="bg-white dark:bg-gray-800 hover:shadow-lg border-gray-200 dark:border-gray-700 h-full">
          <CardContent className="p-4 sm:p-6 lg:p-8 text-center h-full flex flex-col justify-center">
            {/* メインコンテンツ - 自動レイアウト */}
            <div className="flex flex-col xl:flex-row xl:gap-12 h-full max-w-6xl mx-auto w-full">
              {/* 左側：英語の単語と発音 */}
              <div className="xl:flex-1 flex flex-col justify-center text-center xl:text-left">
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 dark:text-gray-200 mb-3 lg:mb-4">
                    {currentWord.word}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-4 lg:mb-6">
                    {currentWord.phonetic}
                  </p>
                  
                  {/* ヒント表示 */}
                  {showHint && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        💡 ヒント: この単語は {currentWord.japanese.length > 0 ? `${currentWord.japanese.length}文字` : '日本語で表現される'} 意味を持ちます
                      </p>
                    </div>
                  )}
                </div>
                
                {/* 発音を聞くボタン */}
                <Button
                  variant="outline"
                  onClick={playWordAudio}
                  className="w-full xl:w-auto mx-auto mb-4 lg:mb-6 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30 px-6 py-3"
                >
                  <Volume2 className="h-5 w-5 mr-2" />
                  発音を聞く
                </Button>

                {/* ヒントボタン */}
                {!showAnswer && !showHint && (
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    className="w-full xl:w-auto mx-auto mb-4 lg:mb-6 bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/30 px-6 py-3"
                  >
                    💡 ヒントを見る
                  </Button>
                )}
              </div>

              {/* 右側：答えの表示と操作 */}
              <div className="xl:flex-1 flex flex-col justify-center">
                {/* 答えの表示 */}
                {showAnswer ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-center max-w-2xl mx-auto xl:mx-0 w-full">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-800 dark:text-green-200 mb-3">
                        意味: {currentWord.japanese}
                      </h3>
                      <p className="text-base lg:text-lg text-green-600 dark:text-green-300">
                        {currentWord.example1_jp}
                      </p>
                    </div>

                    {/* 難易度評価 */}
                    <div className="space-y-4">
                      <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400">
                        この単語の難易度を評価してください：
                      </p>
                      <div className="grid grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map((difficulty) => (
                          <Button
                            key={difficulty}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnswer(true, difficulty)}
                            className="text-sm lg:text-base py-3"
                          >
                            {difficulty}
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                        1: 非常に難しい 〜 5: 非常に簡単
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex-1 flex flex-col justify-center max-w-2xl mx-auto xl:mx-0 w-full">
                    <Button
                      onClick={() => setShowAnswer(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-4 text-lg"
                    >
                      答えを見る
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAnswer(false, 1)}
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20 py-4"
                      >
                        <X className="h-5 w-5 mr-2" />
                        覚えていない
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAnswer(true, 3)}
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 py-4"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        覚えている
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 復習情報 */}
      {currentReviewWord && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0 max-w-6xl mx-auto w-full">
          <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              復習回数: {currentReviewWord.review_count}回
            </div>
            {currentReviewWord.last_reviewed && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                前回復習: {new Date(currentReviewWord.last_reviewed).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
            {currentReviewWord.next_review && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                次回復習予定: {new Date(currentReviewWord.next_review).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 