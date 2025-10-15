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
import type { ReviewWordWithWord } from '@/lib/types';

interface ReviewProps {
  onComplete: () => void;
}

export function Review({ onComplete }: ReviewProps) {
  const [reviewWords, setReviewWords] = useState<ReviewWordWithWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const db = useMemo(() => new DatabaseService(), []);

  const { playWordAudio, playCorrectSound, playIncorrectSound } = useAudioStore();

  // ユーザー認証と復習単語の読み込み
  useEffect(() => {
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

        // 復習リストの単語を取得
        const reviewWordsData = await db.getReviewWords(currentUser.id);

        // すべての単語を取得
        const allWords = await dataProvider.getAllWords();

        // 各復習単語にWord情報を結合
        const reviewWordsWithWords: ReviewWordWithWord[] = [];

        for (const reviewWord of reviewWordsData) {
          const word = allWords.find(w => w.id === reviewWord.word_id);
          if (word) {
            reviewWordsWithWords.push({
              ...reviewWord,
              word
            });
          }
        }

        setReviewWords(reviewWordsWithWords);
      } catch (error) {
        console.error('復習データの読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviewData();
  }, [db]);

  const currentWord = reviewWords[currentIndex];
  const isLastWord = currentIndex === reviewWords.length - 1;

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

  const handleAnswerSelect = useCallback((answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === currentWord.word.japanese;
    
    // 結果を記録
    const newResult = {
      wordId: currentWord.id,
      correct: isCorrect,
    };
    setResults(prev => [...prev, newResult]);
    
    // 音声再生
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }, [currentWord, isAnswered, playCorrectSound, playIncorrectSound]);

  const handleNext = useCallback(() => {
    if (isLastWord) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isLastWord, onComplete]);

  const handleAddToReview = useCallback(async () => {
    if (!user || !currentWord) return;

    try {
      await db.addToReview(user.id, currentWord.id);
      console.log('復習リストに追加:', currentWord.id);
    } catch (error) {
      console.error('復習リスト追加エラー:', error);
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
            復習
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {reviewWords.length}
          </span>
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
            <Button
              variant="outline"
              onClick={handleAddToReview}
              className="flex-1 max-w-xs"
            >
              復習リストに追加
            </Button>
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