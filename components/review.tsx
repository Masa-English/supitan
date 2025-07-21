'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, ReviewWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Check, X, Clock } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/audio-controls';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';

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

  const currentWord = words[currentIndex];
  const currentReviewWord = reviewWords[currentIndex];
  const { speak, isEnabled } = useAudioStore();
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

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
          total_words: reviewWords.length,
          completed_words: 0,
          correct_answers: 0,
          start_time: new Date().toISOString()
        });
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error('復習セッション初期化エラー:', error);
    }
  }, [sessionId, reviewWords.length, supabase, db]);

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
        const newReviewCount = currentReviewWord.review_count + 1;
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
    if (isEnabled && currentWord) {
      speak(currentWord.word);
    }
  };



  if (isLoading) {
    return (
      <div className="text-center py-8">
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
        <p className="text-gray-600 dark:text-gray-400">
          復習リストに追加した単語は、間隔反復アルゴリズムに基づいて適切なタイミングで表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗表示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            復習 {currentIndex + 1} / {words.length}
          </span>
          <AudioControls showQuickControls={true} />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 復習カード */}
      <Card className="bg-white dark:bg-gray-800 hover:shadow-lg border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center">
          {/* 英語の単語 */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {currentWord.word}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentWord.phonetic}
            </p>
          </div>
          
          {/* 発音を聞くボタン */}
          <Button
            variant="outline"
            onClick={playWordAudio}
            className="w-full mb-6 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            発音を聞く
          </Button>

          {/* 答えの表示 */}
          {showAnswer ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  意味: {currentWord.japanese}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {currentWord.example1_jp}
                </p>
              </div>

              {/* 難易度評価 */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  この単語の難易度を評価してください：
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnswer(true, difficulty)}
                      className="text-xs"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  1: 非常に難しい 〜 5: 非常に簡単
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                答えを見る
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(false, 1)}
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  覚えていない
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(true, 3)}
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  覚えている
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 復習情報 */}
      {currentReviewWord && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>復習回数: {currentReviewWord.review_count}回</div>
            {currentReviewWord.last_reviewed && (
              <div>前回復習: {new Date(currentReviewWord.last_reviewed).toLocaleDateString('ja-JP')}</div>
            )}
            {currentReviewWord.next_review && (
              <div>次回復習予定: {new Date(currentReviewWord.next_review).toLocaleDateString('ja-JP')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 