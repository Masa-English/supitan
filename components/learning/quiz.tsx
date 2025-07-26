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
    // 利用可能な例文から1つをランダムに選択
    const availableExamples = [
      correctWord.example1_jp,
      correctWord.example2_jp,
      correctWord.example3_jp
    ].filter((example): example is string => Boolean(example)); // 型ガードで正しく絞り込み
    
    const selectedExample = availableExamples[Math.floor(Math.random() * availableExamples.length)];
    const options = [selectedExample];
    
    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      const otherExamples = [
        shuffled[i].example1_jp,
        shuffled[i].example2_jp,
        shuffled[i].example3_jp
      ].filter((example): example is string => Boolean(example));
      
      if (otherExamples.length > 0) {
        const randomExample = otherExamples[Math.floor(Math.random() * otherExamples.length)];
        options.push(randomExample);
      }
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
        // 利用可能な例文ペアから1つをランダムに選択
        const examplePairs = [
          { jp: word.example1_jp, en: word.example1 },
          { jp: word.example2_jp, en: word.example2 },
          { jp: word.example3_jp, en: word.example3 }
        ].filter((pair): pair is { jp: string; en: string } => Boolean(pair.jp && pair.en));
        
        if (examplePairs.length > 0) {
          const selectedPair = examplePairs[Math.floor(Math.random() * examplePairs.length)];
          
          const exampleQuestion: QuizQuestion = {
            word: {
              ...word,
              example1: selectedPair.en, // 選択された英語例文を使用
              example1_jp: selectedPair.jp // 選択された日本語例文を使用
            },
            options: generateExampleOptions(word),
            correct_answer: selectedPair.jp,
            type: 'example'
          };
          newQuestions.push(exampleQuestion);
        }
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

    // 正解音・不正解音の再生
    if (correct) {
      // 正解音を再生（高い音）
      const correctSound = new SpeechSynthesisUtterance('Correct!');
      correctSound.lang = 'en-US';
      correctSound.rate = 1.2;
      correctSound.pitch = 1.5;
      correctSound.volume = 0.7;
      speechSynthesis.speak(correctSound);
    } else {
      // 不正解音を再生（低い音）
      const incorrectSound = new SpeechSynthesisUtterance('Try again');
      incorrectSound.lang = 'en-US';
      incorrectSound.rate = 0.8;
      incorrectSound.pitch = 0.7;
      incorrectSound.volume = 0.7;
      speechSynthesis.speak(incorrectSound);
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
    if (currentQuestion?.word?.word) {
      // Web Speech APIを使用して音声を再生
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
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
    <div className="h-full flex flex-col">
      {/* 進捗表示 */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
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
                ? 'border-primary text-primary bg-primary/10'
                : 'border-primary text-primary bg-primary/10'
            }`}
          >
            <Brain className="h-4 w-4 mr-1" />
            {currentQuestion.type === 'meaning' ? '意味問題' : '例文問題'}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="flex-1 min-h-0 mb-4">
        <Card className="bg-card border-border shadow-lg h-full">
          <CardContent className="p-4 sm:p-6 h-full flex flex-col overflow-y-auto">
            {/* 問題文セクション */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                  {currentQuestion.word.word}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playAudio}
                  className="text-primary hover:bg-accent"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6">
                {currentQuestion.word.phonetic}
              </p>
              
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                {currentQuestion.type === 'meaning' 
                  ? 'この単語の意味を選んでください'
                  : 'この単語を使った例文の日本語訳を選んでください'
                }
              </h3>
              
              {currentQuestion.type === 'example' && (
                <div className="bg-accent rounded-xl p-4 mb-6 border border-border max-w-4xl mx-auto">
                  <p className="text-foreground text-center italic text-base sm:text-lg">
                    &ldquo;{currentQuestion.word.example1}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* 選択肢セクション - 自動レイアウト */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === currentQuestion.correct_answer;
                    const isWrongSelected = showResult && isSelected && !isCorrectOption;
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto p-4 sm:p-6 text-sm sm:text-base transition-all duration-200 min-h-[80px] ${
                          showResult
                            ? isCorrectOption
                              ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/20'
                              : isWrongSelected
                              ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/20'
                              : 'bg-accent border-border text-foreground'
                            : isSelected
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'hover:bg-accent border-border text-foreground'
                        }`}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult}
                      >
                        <div className="flex items-start justify-between w-full gap-3">
                          <span className="flex-1 text-left break-words leading-relaxed">{option}</span>
                          {showResult && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isCorrectOption && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="text-sm font-medium hidden sm:inline">正解</span>
                                </div>
                              )}
                              {isWrongSelected && (
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="text-sm font-medium hidden sm:inline">不正解</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 結果表示 */}
      {showResult && (
        <Card className={`mb-4 flex-shrink-0 max-w-4xl mx-auto w-full ${
          isCorrect 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
        }`}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">
                {isCorrect ? '🎉 正解！' : '😅 不正解'}
              </div>
              <div className="mb-3 sm:mb-4">
                <p className="text-base sm:text-lg font-medium text-foreground mb-2">
                  正解: <span className="text-primary">{currentQuestion.correct_answer}</span>
                </p>
                {!isCorrect && (
                  <p className="text-muted-foreground text-sm sm:text-base">
                    あなたの回答: <span className="text-red-600 dark:text-red-400">{selectedAnswer}</span>
                  </p>
                )}
              </div>
              {!isCorrect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToReview}
                  className="border-primary text-primary hover:bg-primary/10"
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
        <div className="text-center flex-shrink-0">
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-lg"
          >
            {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
          </Button>
        </div>
      )}
    </div>
  );
} 