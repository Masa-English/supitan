'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { DatabaseService } from '@/lib/database';
import { Word, ReviewWord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Volume2, Check, X, Clock, BookOpen } from 'lucide-react';
import { AudioControls } from '@/components/common/audio-controls';
import { AudioInitializer } from './audio-initializer';

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
    <AudioInitializer>
      <div className="h-screen flex flex-col" style={{ minHeight: '100dvh' }}>
        {/* ヘッダー部分 */}
        <div className="flex-shrink-0 p-2 border-b border-border bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  復習 {currentIndex + 1} / {words.length}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {Math.round(((currentIndex + 1) / words.length) * 100)}% 完了
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(sessionDuration)}
                </div>
                <AudioControls />
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          <div className="max-w-6xl mx-auto w-full h-auto flex flex-col">
            <div className="flex-1 flex items-center justify-center min-h-0 pb-6 sm:pb-0">
              <div className="w-full max-h-full overflow-y-auto">
                <div className="bg-card border border-border shadow-lg rounded-xl mt-2 p-4 relative">
                  {/* 単語セクション */}
                  <div className="text-center mb-3">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                        {currentWord.word}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playWordAudio}
                        className="text-primary hover:bg-accent touch-target"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {currentWord.phonetic}
                    </p>
                  </div>

                  {/* 答え表示 */}
                  {showAnswer && (
                    <div className="mb-4">
                      <div className="bg-accent rounded-lg p-3 border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-2">意味</h3>
                        <p className="text-foreground font-medium leading-relaxed">
                          {currentWord.japanese}
                        </p>
                      </div>
                      
                      {currentWord.example1_jp && (
                        <div className="bg-accent rounded-lg p-3 border border-border mt-3">
                          <h3 className="text-lg font-semibold text-foreground mb-2">例文</h3>
                          <p className="text-foreground font-medium text-sm leading-relaxed">
                            {currentWord.example1_jp}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 操作ボタン */}
                  <div className="space-y-3">
                    {!showAnswer && (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium touch-target h-12"
                      >
                        答えを見る
                      </Button>
                    )}

                    {showAnswer && (
                      <div className="flex gap-2 sm:gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleAnswer(false, 1)}
                          className="flex-1 h-12 px-4 py-3 text-sm font-medium touch-target"
                        >
                          <X className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">難しい</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleAnswer(true, 3)}
                          className="flex-1 h-12 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium touch-target"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">簡単</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AudioInitializer>
  );
} 