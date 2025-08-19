'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCircle, Brain, ArrowRight, XCircle } from 'lucide-react';
import { useAudioStore } from '@/lib/stores';
import { AudioControls } from '@/components/common/audio-controls';

interface QuizProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onAddToReview: (wordId: string) => void;
  initialQuestions?: QuizQuestion[];
  key?: string | number; // リセット用のキーを追加
}

export function Quiz({
  words,
  onComplete,
  onAddToReview,
  initialQuestions
}: QuizProps) {
  console.log('[Quiz] コンポーネントマウント', { wordsLength: words.length });
  
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // 音声ストア
  const { playCorrectSound, playIncorrectSound, initializeAudio, isInitialized } = useAudioStore();

  // 音声初期化
  useEffect(() => {
    console.log('[Quiz] 音声初期化チェック', { isInitialized });
    if (!isInitialized) {
      console.log('[Quiz] 音声初期化開始');
      initializeAudio();
    }
  }, [initializeAudio, isInitialized]);

  const currentQuestion = questions[currentIndex];



  const generateJapaneseToEnglishOptions = useCallback((correctWord: Word): string[] => {
    // 正解を必ず含める
    const options = [correctWord.word];

    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);

    // 3つの選択肢を追加（重複を避ける）
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      if (!options.includes(shuffled[i].word)) {
        options.push(shuffled[i].word);
      }
    }

    // 選択肢が4つ未満の場合は、正解を複製して追加
    while (options.length < 4) {
      options.push(correctWord.word);
    }

    return options.sort(() => Math.random() - 0.5);
  }, [words]);

  // 問題タイプの強制統一（既存の問題データがある場合の対策）
  const normalizedQuestion = currentQuestion ? {
    ...currentQuestion,
    type: 'japanese_to_english' as const,
    options: currentQuestion.type === 'meaning' 
      ? generateJapaneseToEnglishOptions(currentQuestion.word)
      : currentQuestion.options,
    correct_answer: currentQuestion.type === 'meaning'
      ? currentQuestion.word.word
      : currentQuestion.correct_answer,
    question: `${currentQuestion.word.japanese}の英語を選んでください`
  } : null;

  const generateQuestions = useCallback(() => {
    const newQuestions: QuizQuestion[] = [];

    words.forEach(word => {
      // 日本語から英語を選ぶ問題
      const japaneseToEnglishOptions = generateJapaneseToEnglishOptions(word);
      
      const japaneseToEnglishQuestion: QuizQuestion = {
        word,
        options: japaneseToEnglishOptions,
        correct_answer: word.word,
        type: 'japanese_to_english',
        question: `${word.japanese}の英語を選んでください`
      };
      newQuestions.push(japaneseToEnglishQuestion);
    });

    // 問題をシャッフル
    const shuffled = newQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, [words, generateJapaneseToEnglishOptions]);

  useEffect(() => {
    let timeoutId: number | null = null;
    if (questions.length === 0) {
      if (words.length > 0 && typeof window !== 'undefined') {
        timeoutId = window.setTimeout(() => {
          generateQuestions();
        }, 150);
      }
    }
    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [generateQuestions, words.length, questions.length]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentIndex]);

     const handleAnswerSelect = async (answer: string) => {
     if (selectedAnswer || showResult || !normalizedQuestion) return;

     console.log('[Quiz] 回答選択', { answer, correctAnswer: normalizedQuestion.correct_answer });
     
     setSelectedAnswer(answer);
     const correct = answer === normalizedQuestion.correct_answer;
     setIsCorrect(correct);
     setShowResult(true);

     console.log('[Quiz] 音声再生開始', { correct, isInitialized });
     // 音声が初期化されている場合のみ音声再生
     if (isInitialized) {
       try {
         if (correct) {
           console.log('[Quiz] 正解音再生呼び出し');
           await playCorrectSound();
         } else {
           console.log('[Quiz] 不正解音再生呼び出し');
           await playIncorrectSound();
         }
       } catch (error) {
         console.error('[Quiz] 音声再生エラー:', error);
       }
     } else {
       console.log('[Quiz] 音声が初期化されていないため音声再生をスキップ');
     }
   };

     const handleNext = () => {
     if (!normalizedQuestion) return;
     const correct = selectedAnswer === normalizedQuestion.correct_answer;
     const newResults = [...results, { wordId: normalizedQuestion.word.id, correct }];
     setResults(newResults);

     if (currentIndex < questions.length - 1) {
       setCurrentIndex(currentIndex + 1);
     } else {
       onComplete(newResults);
     }
   };

   const handleAddToReview = () => {
     if (!normalizedQuestion) return;
     onAddToReview(normalizedQuestion.word.id);
   };





  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">出題できる問題がありません。前の画面に戻って条件を変更してください。</p> 
      </div>
    );
  }

  if (!normalizedQuestion) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">問題を生成中...</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / Math.max(questions.length, 1)) * 100;

  return (
    <div className="h-screen flex flex-col safe-bottom">
      {/* ヘッダー部分 - 進捗表示 */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto">
          {/* 進捗情報 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  {currentIndex + 1}
                </span>
                <span className="text-muted-foreground">/ {questions.length}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* 音声コントロール */}
            <div className="flex items-center gap-3">
              <AudioControls />
            </div>
          </div>

          <div className="flex items-center justify-end mb-3">
            <Badge
                variant="outline"
                className="px-3 py-1.5 border-primary text-primary bg-primary/10 text-sm font-medium"
              >
                <Brain className="h-4 w-4 mr-1.5" />
                日本語→英語
              </Badge>
          </div>

          {/* 進捗バー */}
          <div className="w-full rounded-full h-2 overflow-hiddenw-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ - スクロール可能なエリア */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          {/* 問題カード */}
          <div className="flex-1 mb-4">
            <Card className="bg-card border-border shadow-lg h-full">
              <CardContent className="p-6 h-full flex flex-col">
                {/* 問題文セクション */}
                <div className="text-center mb-6 flex-shrink-0">
                  {/* 日本語の出題 */}
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-foreground break-words bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {normalizedQuestion.word.japanese}
                    </h2>
                  </div>

                  {/* 問題文 */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <p className="text-lg text-foreground font-medium">
                      {normalizedQuestion.question || `${normalizedQuestion.word.japanese}の英語を選んでください`}
                    </p>
                  </div>
                </div>

                {/* 選択肢 */}
                <div className="flex-1 space-y-3">
                  {normalizedQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                      className={`w-full h-14 text-left justify-start p-4 text-lg font-medium transition-all duration-300 rounded-lg border-2 hover:shadow-md ${
                        selectedAnswer === option
                          ? option === normalizedQuestion.correct_answer
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600 dark:text-green-300'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800 shadow-lg dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-600 dark:text-red-300'
                          : 'hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:border-primary/50 hover:text-primary'
                      } touch-target group`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                        {selectedAnswer === option && (
                          <div className="ml-3">
                            {option === normalizedQuestion.correct_answer ? (
                              <CheckCircle className="h-6 w-6 text-green-600 animate-bounce" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600 animate-bounce" />
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 結果表示 */}
            {showResult && (
              <Card className={`mb-4 flex-shrink-0 border-2 ${
                isCorrect
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700'
              } shadow-lg`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="bg-card rounded-lg p-4 mb-3 border border-border">
                      <p className="text-base font-medium text-foreground mb-2">
                        正解: <span className="text-primary font-bold">{normalizedQuestion.correct_answer}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-muted-foreground">
                          あなたの回答: <span className="text-red-600 dark:text-red-400 font-medium">{selectedAnswer}</span>
                        </p>
                      )}
                    </div>
                    {!isCorrect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddToReview}
                        className="border-primary text-primary hover:bg-primary/10 text-sm h-9 rounded-lg"
                      >
                        <Brain className="h-3 w-3 mr-2" />
                        復習リストに追加
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 次へボタン - 画面右側に固定 */}
      {showResult && (
        <div className="fixed bottom-4 right-4 z-50 safe-bottom">
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground touch-target rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 flex items-center justify-center"
          >
            {currentIndex === questions.length - 1 ? (
              <Check className="h-6 w-6" />
            ) : (
              <ArrowRight className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
