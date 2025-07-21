'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check, X, CheckCircle, Brain } from 'lucide-react';

interface QuizProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onAddToReview: (wordId: string) => void;
}

export function Quiz({
  words,
  onComplete,
  onAddToReview
}: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentIndex];

  const generateMeaningOptions = useCallback((correctWord: Word): string[] => {
    const options = [correctWord.japanese];
    
    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i].japanese);
    }

    return options.sort(() => Math.random() - 0.5);
  }, [words]);

  const generateExampleOptions = useCallback((correctWord: Word): string[] => {
    const options = [correctWord.example1_jp];
    
    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i].example1_jp);
    }

    return options.sort(() => Math.random() - 0.5);
  }, [words]);

  const generateQuestions = useCallback(() => {
    const newQuestions: QuizQuestion[] = [];
    
    words.forEach(word => {
      // 意味を問う問題
      const meaningQuestion: QuizQuestion = {
        word,
        options: generateMeaningOptions(word),
        correct_answer: word.japanese,
        type: 'meaning'
      };
      newQuestions.push(meaningQuestion);

      // 例文を問う問題（ランダムに選択）
      if (Math.random() > 0.5) {
        const exampleQuestion: QuizQuestion = {
          word,
          options: generateExampleOptions(word),
          correct_answer: word.example1_jp,
          type: 'example'
        };
        newQuestions.push(exampleQuestion);
      }
    });

    // 問題をシャッフル
    const shuffled = newQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, [words, generateMeaningOptions, generateExampleOptions]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentIndex]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    // 正解音・不正解音の再生（実装予定）
    if (correct) {
      console.log('正解音再生');
    } else {
      console.log('不正解音再生');
    }
  };

  const handleNext = () => {
    const correct = selectedAnswer === currentQuestion.correct_answer;
    const newResults = [...results, { wordId: currentQuestion.word.id, correct }];
    setResults(newResults);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResults);
    }
  };

  const handleAddToReview = () => {
    onAddToReview(currentQuestion.word.id);
  };

  const playAudio = () => {
    console.log('音声再生:', currentQuestion.word.word);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-amber-700 dark:text-amber-300">問題を生成中...</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 進捗表示 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-amber-800 dark:text-amber-200">
              問題 {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <CheckCircle className="h-4 w-4" />
              {Math.round(progress)}% 完了
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${
              currentQuestion.type === 'meaning' 
                ? 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/20'
                : 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:bg-purple-900/20'
            }`}
          >
            <Brain className="h-4 w-4 mr-1" />
            {currentQuestion.type === 'meaning' ? '意味問題' : '例文問題'}
          </Badge>
        </div>
        <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <Card className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700 mb-8 border-amber-200 dark:border-amber-700 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold text-amber-800 dark:text-amber-200">
                {currentQuestion.word.word}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-lg text-amber-600 dark:text-amber-400 mb-6">
              {currentQuestion.word.phonetic}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-6 text-center">
              {currentQuestion.type === 'meaning' 
                ? 'この単語の意味を選んでください'
                : 'この単語を使った例文の日本語訳を選んでください'
              }
            </h3>
            {currentQuestion.type === 'example' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-200 dark:border-amber-600">
                <p className="text-amber-800 dark:text-amber-200 text-center italic text-lg">
                  &ldquo;{currentQuestion.word.example1}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* 選択肢 */}
          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correct_answer;
              const isWrongSelected = showResult && isSelected && !isCorrectOption;
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto p-6 text-base transition-all duration-200 ${
                    showResult
                      ? isCorrectOption
                        ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/20'
                        : isWrongSelected
                        ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/20'
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                      : isSelected
                      ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/20 dark:border-amber-400 dark:text-amber-200'
                      : 'hover:bg-amber-50 dark:hover:bg-amber-900/10 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1">{option}</span>
                    {showResult && (
                      <div className="flex items-center gap-2 ml-4">
                        {isCorrectOption && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-5 w-5" />
                            <span className="text-sm font-medium">正解</span>
                          </div>
                        )}
                        {isWrongSelected && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="h-5 w-5" />
                            <span className="text-sm font-medium">不正解</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 結果表示 */}
      {showResult && (
        <Card className={`mb-8 ${
          isCorrect 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
        }`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl mb-4">
                {isCorrect ? '🎉 正解！' : '😅 不正解'}
              </div>
              <div className="mb-4">
                <p className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">
                  正解: <span className="text-amber-600 dark:text-amber-400">{currentQuestion.correct_answer}</span>
                </p>
                {!isCorrect && (
                  <p className="text-amber-700 dark:text-amber-300">
                    あなたの回答: <span className="text-red-600 dark:text-red-400">{selectedAnswer}</span>
                  </p>
                )}
              </div>
              {!isCorrect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToReview}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  復習リストに追加
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 次へボタン */}
      {showResult && (
        <div className="text-center">
          <Button
            onClick={handleNext}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white text-lg"
          >
            {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
          </Button>
        </div>
      )}
    </div>
  );
} 