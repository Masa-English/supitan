'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/navigation/badge';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';
import { useAudioStore } from '@/lib/stores';
import { DatabaseService } from '@/lib/api/database/database';
import { dataProvider } from '@/lib/api/services/data-provider';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import type { ReviewWordWithWord, UserProgressUpdate } from '@/lib/types/database';

interface ReviewProps {
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onExit?: () => void;
  mode?: 'review-list' | 'interval' | 'category' | 'urgent';
  category?: string;
  level?: number;
  reviewWords?: ReviewWordWithWord[];
}

export function Review({ onComplete, onExit, mode = 'review-list', category, level, reviewWords: initialReviewWords }: ReviewProps) {
  const [reviewWords, setReviewWords] = useState<ReviewWordWithWord[]>(initialReviewWords || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(!initialReviewWords);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [results, setResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const db = useMemo(() => new DatabaseService(), []);

  const { playWordAudio, playCorrectSound, playIncorrectSound } = useAudioStore();

  // ユーザー認証と復習単語の読み込み
  useEffect(() => {
    // 既にreviewWordsが渡されている場合は認証のみ確認
    if (initialReviewWords && initialReviewWords.length > 0) {
      const checkAuth = async () => {
        try {
          const supabase = createBrowserClient();
          const { data: { user: currentUser }, error } = await supabase.auth.getUser();

          if (error || !currentUser) {
            console.error('認証エラー:', error);
            return;
          }

          setUser(currentUser);
        } catch (error) {
          console.error('認証確認エラー:', error);
        }
      };
      checkAuth();
      return;
    }

    // reviewWordsが渡されていない場合のみデータ取得
    const loadReviewData = async () => {
      try {
        setLoading(true);

        // ユーザーの認証確認
        const supabase = createBrowserClient();
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error || !currentUser) {
          console.error('認証エラー:', error);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // すべての単語を取得
        const allWords = await dataProvider.getAllWords();
        const userProgress = await dataProvider.getUserProgress(currentUser.id);

        const reviewWordsData: ReviewWordWithWord[] = [];

        if (mode === 'review-list') {
          // 復習リストの単語を取得
          const reviewListWords = await db.getReviewWords(currentUser.id);

          // 各復習単語にWord情報を結合
          for (const reviewWord of reviewListWords) {
            const word = allWords.find(w => w.id === reviewWord.word_id);
            if (word) {
              reviewWordsData.push({
                ...reviewWord,
                word,
                created_at: reviewWord.added_at ?? new Date().toISOString() // added_atがnullまたはundefinedの場合は現在時刻を使用
              });
            }
          }
        } else if (mode === 'interval') {
          // 間隔復習が必要な単語を取得（習得レベルに応じた復習間隔）
          const now = new Date();

          for (const progress of userProgress) {
            if (!progress.last_studied) continue;

            const lastReview = new Date(progress.last_studied);
            const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

            // 習得レベルに応じた復習間隔
            const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
            const reviewInterval = {
              1: 1, 2: 3, 3: 7, 4: 14, 5: 30
            }[masteryLevel] || 1;

            // レベル指定がある場合はそのレベルのみ
            if (level && masteryLevel !== level) continue;

            if (daysSinceReview >= reviewInterval) {
              const word = allWords.find(w => w.id === progress.word_id);
              if (word) {
                reviewWordsData.push({
                  id: `${progress.word_id}-interval`,
                  user_id: progress.user_id || '',
                  word_id: progress.word_id || '',
                  created_at: new Date().toISOString(),
                  word
                });
              }
            }
          }
        } else if (mode === 'category' && category) {
          // 指定されたカテゴリの復習が必要な単語を取得
          const categoryWords = allWords.filter(w => w.category === category);
          const now = new Date();

          for (const progress of userProgress) {
            if (!progress.last_studied) continue;

            const word = categoryWords.find(w => w.id === progress.word_id);
            if (!word) continue;

            const lastReview = new Date(progress.last_studied);
            const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

            // 習得レベルに応じた復習間隔
            const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
            const reviewInterval = {
              1: 1, 2: 3, 3: 7, 4: 14, 5: 30
            }[masteryLevel] || 1;

            if (daysSinceReview >= reviewInterval) {
              reviewWordsData.push({
                id: `${progress.word_id}-category`,
                user_id: progress.user_id || '',
                word_id: progress.word_id || '',
                created_at: new Date().toISOString(),
                word
              });
            }
          }
        } else if (mode === 'urgent') {
          // 緊急復習が必要な単語を取得（予定より大幅に遅れている単語）
          const now = new Date();

          for (const progress of userProgress) {
            if (!progress.last_studied) continue;

            const lastReview = new Date(progress.last_studied);
            const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

            // 習得レベルに応じた復習間隔
            const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
            const reviewInterval = {
              1: 1, 2: 3, 3: 7, 4: 14, 5: 30
            }[masteryLevel] || 1;

            // 予定の2倍経過している場合を緊急復習とする
            if (daysSinceReview >= reviewInterval * 2) {
              const word = allWords.find(w => w.id === progress.word_id);
              if (word) {
                reviewWordsData.push({
                  id: `${progress.word_id}-urgent`,
                  user_id: progress.user_id || '',
                  word_id: progress.word_id || '',
                  created_at: new Date().toISOString(),
                  word
                });
              }
            }
          }
        }

        setReviewWords(reviewWordsData);
      } catch (error) {
        console.error('復習データの読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviewData();
  }, [db, mode, category, level, initialReviewWords]);

  const currentWord = reviewWords[currentIndex];
  const isLastWord = currentIndex === reviewWords.length - 1;

  // 現在の単語が復習リストにあるかどうかチェック
  const isInReviewList = useMemo(() => {
    if (!user || !currentWord || mode !== 'review-list') return false;
    return reviewWords.some(rw => rw.word_id === currentWord.word_id);
  }, [user, currentWord, reviewWords, mode]);

  // 復習用の選択肢を生成
  const options = useMemo(() => {
    if (!currentWord) return [];
    
    const correctAnswer = currentWord.word.japanese;
    const otherWords = reviewWords.filter(w => w.id !== currentWord.id);
    const wrongOptions = otherWords
      .slice(0, 3)
      .map(w => w.word.japanese)
      .filter(japanese => japanese !== correctAnswer);
    
    const allOptions = [correctAnswer, ...wrongOptions];
    
    // 4つの選択肢になるまでダミーを追加
    while (allOptions.length < 4) {
      allOptions.push(`選択肢${allOptions.length + 1}`);
    }
    
    return allOptions.sort(() => Math.random() - 0.5);
  }, [currentWord, reviewWords]);

  const handleAnswerSelect = useCallback(async (answer: string) => {
    if (isAnswered || !user) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentWord.word.japanese;

    // 結果を記録
    const newResult = {
      wordId: currentWord.word_id || '',
      correct: isCorrect,
    };
    setResults(prev => [...prev, newResult]);

    // データベースに進捗を更新
    try {
      const progressUpdates: UserProgressUpdate = {
        last_studied: new Date().toISOString(),
        study_count: 1, // 復習なので1カウント
      };

      if (isCorrect) {
        // 正解の場合、習得レベルを上げるロジック
        const allProgress = await dataProvider.getUserProgress(user.id);
        const currentProgress = allProgress.find(p => p.word_id === currentWord.word_id);
        const currentMasteryLevel = currentProgress?.mastery_level || 0;
        const newMasteryLevel = Math.min(currentMasteryLevel + 0.1, 1.0); // 最大1.0まで
        progressUpdates.mastery_level = newMasteryLevel;
        progressUpdates.correct_count = (currentProgress?.correct_count || 0) + 1;
      } else {
        // 不正解の場合、習得レベルを下げるロジック
        const allProgress = await dataProvider.getUserProgress(user.id);
        const currentProgress = allProgress.find(p => p.word_id === currentWord.word_id);
        const currentMasteryLevel = currentProgress?.mastery_level || 0;
        const newMasteryLevel = Math.max(currentMasteryLevel - 0.05, 0.0); // 最小0.0まで
        progressUpdates.mastery_level = newMasteryLevel;
        progressUpdates.incorrect_count = (currentProgress?.incorrect_count || 0) + 1;
      }

      if (user?.id && currentWord.word_id) {
        await db.updateProgress(user.id, currentWord.word_id, progressUpdates);
      }
      console.log('復習進捗を更新:', currentWord.word_id, progressUpdates);
    } catch (error) {
      console.error('復習進捗更新エラー:', error);
    }

    // 音声再生
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }, [currentWord, isAnswered, user, playCorrectSound, playIncorrectSound, db]);

  const handleNext = useCallback(() => {
    if (isLastWord) {
      onComplete(results);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isLastWord, onComplete, results]);

  const handleAddToReview = useCallback(async () => {
    if (!user || !currentWord) return;

    try {
      if (user?.id && currentWord.word_id) {
        await db.addToReview(user.id, currentWord.word_id);
        console.log('復習リストに追加:', currentWord.word_id);
      }
    } catch (error) {
      console.error('復習リスト追加エラー:', error);
    }
  }, [user, currentWord, db]);

  const handleRemoveFromReview = useCallback(async () => {
    if (!user || !currentWord) return;

    try {
      if (user?.id && currentWord.word_id) {
        await db.removeFromReview(user.id, currentWord.word_id);
        console.log('復習リストから削除:', currentWord.word_id);
      }
    } catch (error) {
      console.error('復習リスト削除エラー:', error);
    }
  }, [user, currentWord, db]);

  const handlePlayAudio = useCallback(() => {
    playWordAudio(currentWord.id);
  }, [currentWord.id, playWordAudio]);

  if (loading || !currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {loading ? '復習単語を読み込み中...' : '復習単語がありません'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-sm">
            {mode === 'review-list' ? '復習リスト' :
             mode === 'interval' ? '間隔復習' :
             mode === 'category' ? 'カテゴリ別復習' :
             mode === 'urgent' ? '緊急復習' : '復習'}
          </Badge>
          <div className="flex items-center gap-3">
            {onExit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
                className="text-sm"
              >
                復習終了
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {reviewWords.length}
            </span>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
               <h2 className="text-3xl font-bold mb-2">{currentWord.word.word}</h2>
               {currentWord.word.phonetic && (
                 <p className="text-lg text-muted-foreground mb-4">
                   [{currentWord.word.phonetic}]
                 </p>
               )}
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayAudio}
                className="mb-4"
              >
                <Volume2 className="h-6 w-6 mr-2" />
                音声を再生
              </Button>
            </div>
            
            <p className="text-xl font-medium text-center mb-6">
               {currentWord.word.word}の意味を選んでください
            </p>
            
            <div className="grid gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                 const isCorrect = option === currentWord.word.japanese;
                const showCorrect = isAnswered && isCorrect;
                const showIncorrect = isAnswered && isSelected && !isCorrect;
                
                return (
                  <Button
                    key={index}
                    variant={showCorrect ? "default" : showIncorrect ? "destructive" : "outline"}
                    size="lg"
                    className={`h-16 text-lg justify-start ${
                      showCorrect ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  >
                    <span className="mr-3 font-bold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                    {showCorrect && <CheckCircle className="h-5 w-5 ml-auto" />}
                    {showIncorrect && <XCircle className="h-5 w-5 ml-auto" />}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {isAnswered && (
          <div className="flex gap-3 justify-center">
            {mode === 'review-list' ? (
              isInReviewList ? (
                <Button
                  variant="outline"
                  onClick={handleRemoveFromReview}
                  className="flex-1 max-w-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  復習リストから削除
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleAddToReview}
                  className="flex-1 max-w-xs"
                >
                  復習リストに追加
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                onClick={handleAddToReview}
                className="flex-1 max-w-xs"
              >
                復習リストに追加
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 max-w-xs"
            >
              {isLastWord ? '完了' : '次へ'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Review;