'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check, X } from 'lucide-react';

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
        <p className="text-amber-700 dark:text-amber-300">問題を生成中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗表示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            問題 {currentIndex + 1} / {questions.length}
          </span>
          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
            {currentQuestion.type === 'meaning' ? '意味' : '例文'}
          </Badge>
        </div>
        <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-2">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-6 border-amber-200 dark:border-amber-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                {currentQuestion.word.word}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {currentQuestion.word.phonetic}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4">
              {currentQuestion.type === 'meaning' 
                ? 'この単語の意味を選んでください'
                : 'この単語を使った例文の日本語訳を選んでください'
              }
            </h3>
                         {currentQuestion.type === 'example' && (
               <p className="text-amber-700 dark:text-amber-300 mb-4 italic">
                 &ldquo;{currentQuestion.word.example1}&rdquo;
               </p>
             )}
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? 'default' : 'outline'}
                className={`w-full justify-start text-left h-auto p-4 ${
                  showResult
                    ? option === currentQuestion.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200'
                      : selectedAnswer === option
                      ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                    : selectedAnswer === option
                    ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/20 dark:border-amber-400 dark:text-amber-200'
                    : 'hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{option}</span>
                  {showResult && (
                    <div className="flex items-center gap-2">
                      {option === currentQuestion.correct_answer && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      {selectedAnswer === option && option !== currentQuestion.correct_answer && (
                        <X className="h-4 w-4 text-red-600" />
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
        <Card className={`mb-6 ${
          isCorrect 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        }`}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {isCorrect ? '✅ 正解！' : '❌ 不正解'}
              </div>
              <p className="text-amber-700 dark:text-amber-300 mb-2">
                正解: {currentQuestion.correct_answer}
              </p>
              {!isCorrect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToReview}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20"
                >
                  復習に追加
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
            className="px-8 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
          </Button>
        </div>
      )}
    </div>
  );
} 