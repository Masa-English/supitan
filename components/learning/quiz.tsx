'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check, X, CheckCircle, Brain } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/common/audio-controls';
import { AudioInitializer } from './audio-initializer';

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
  
  // 音声ストア
  const { playCorrectSound, playIncorrectSound } = useAudioStore();

  const currentQuestion = questions[currentIndex];

  const generateMeaningOptions = useCallback((correctWord: Word): string[] => {
    // 正解を必ず含める
    const options = [correctWord.japanese];
    
    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    
    // 3つの選択肢を追加（重複を避ける）
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      if (!options.includes(shuffled[i].japanese)) {
        options.push(shuffled[i].japanese);
      }
    }
    
    // 選択肢が4つ未満の場合は、正解を複製して追加
    while (options.length < 4) {
      options.push(correctWord.japanese);
    }

    return options.sort(() => Math.random() - 0.5);
  }, [words]);

  const generateExampleOptions = useCallback((correctWord: Word): string[] => {
    // 利用可能な例文から1つをランダムに選択
    const availableExamples = [
      correctWord.example1_jp,
      correctWord.example2_jp,
      correctWord.example3_jp
    ].filter((example): example is string => Boolean(example));
    
    // 正解の例文が存在しない場合は空の配列を返す
    if (availableExamples.length === 0) {
      return [];
    }
    
    const selectedExample = availableExamples[Math.floor(Math.random() * availableExamples.length)];
    const options = [selectedExample];
    
    // 他の単語から3つの選択肢を追加
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    
    // 3つの選択肢を追加（重複を避ける）
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      const otherExamples = [
        shuffled[i].example1_jp,
        shuffled[i].example2_jp,
        shuffled[i].example3_jp
      ].filter((example): example is string => Boolean(example));
      
      if (otherExamples.length > 0) {
        const randomExample = otherExamples[Math.floor(Math.random() * otherExamples.length)];
        if (!options.includes(randomExample)) {
          options.push(randomExample);
        }
      }
    }
    
    // 選択肢が4つ未満の場合は、正解の例文を複製して追加
    while (options.length < 4) {
      options.push(selectedExample);
    }

    return options.sort(() => Math.random() - 0.5);
  }, [words]);

  const generateQuestions = useCallback(() => {
    const newQuestions: QuizQuestion[] = [];
    
    words.forEach(word => {
      // 意味を問う問題
      const meaningOptions = generateMeaningOptions(word);
      const meaningQuestion: QuizQuestion = {
        word,
        options: meaningOptions,
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
          const exampleOptions = generateExampleOptions(word);
          
          // 例文の選択肢が生成できた場合のみ問題を追加
          if (exampleOptions.length > 0) {
            const exampleQuestion: QuizQuestion = {
              word: {
                ...word,
                example1: selectedPair.en, // 選択された英語例文を使用
                example1_jp: selectedPair.jp // 選択された日本語例文を使用
              },
              options: exampleOptions,
              correct_answer: selectedPair.jp,
              type: 'example'
            };
            newQuestions.push(exampleQuestion);
          }
        }
      }
    });

    // 問題をシャッフル
    const shuffled = newQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, [words, generateMeaningOptions, generateExampleOptions]);

  useEffect(() => {
    if (words.length > 0) {
      // クライアントサイドでのみ問題を生成
      if (typeof window !== 'undefined') {
        generateQuestions();
      }
    }
  }, [generateQuestions, words.length]);

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
      playCorrectSound();
    } else {
      playIncorrectSound();
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
      // 音声ファイルがある場合は音声ファイルを再生、ない場合はWeb Speech APIを使用
      if (currentQuestion.word.audio_file) {
        const { playWordAudio } = useAudioStore.getState();
        playWordAudio(currentQuestion.word.id);
      } else {
        // Web Speech APIを使用して音声を再生
        const utterance = new SpeechSynthesisUtterance(currentQuestion.word.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">問題を生成中...</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <AudioInitializer>
      <div className="h-screen flex flex-col">
        {/* ヘッダー部分 - 進捗表示 */}
        <div className="flex-shrink-0 p-2 sm:p-3 lg:p-4 border-b border-border bg-background">
          <div className="max-w-6xl mx-auto">
            {/* 進捗情報 */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* スマホでは問題番号を非表示 */}
                <span className="hidden sm:inline text-sm sm:text-base lg:text-lg font-medium text-foreground">
                  問題 {currentIndex + 1} / {questions.length}
                </span>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  {Math.round(progress)}% 完了
                </div>
              </div>
              
              {/* 音声コントロール */}
              <div className="flex items-center gap-2">
                <AudioControls />
                <Badge 
                  variant="outline" 
                  className="px-2 sm:px-3 py-1 border-primary text-primary bg-primary/10 text-xs sm:text-sm"
                >
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {currentQuestion.type === 'meaning' ? '意味問題' : '例文問題'}
                </Badge>
              </div>
            </div>
            
            {/* 進捗バー */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* メインコンテンツ - スクロール可能なエリア */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
          <div className="max-w-6xl mx-auto min-h-full flex flex-col">
            {/* 問題カード */}
            <div className="flex-1 mb-3 sm:mb-4">
              <Card className="bg-card border-border shadow-lg h-full">
                <CardContent className="p-2 sm:p-3 lg:p-4 h-full flex flex-col">
                  {/* 問題文セクション */}
                  <div className="text-center mb-2 sm:mb-3 lg:mb-4 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground break-words">
                        {currentQuestion.word.word}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playAudio}
                        className="text-primary hover:bg-accent touch-target"
                      >
                        <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-2 sm:mb-3">
                      {currentQuestion.word.phonetic}
                    </p>
                    
                    <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      {currentQuestion.type === 'meaning' 
                        ? 'この単語の意味を選んでください'
                        : 'この単語を使った例文の日本語訳を選んでください'
                      }
                    </h3>
                    
                    {currentQuestion.type === 'example' && (
                      <div className="bg-accent rounded-xl p-2 sm:p-3 mb-2 sm:mb-3 border border-border max-w-4xl mx-auto">
                        <p className="text-foreground text-center italic text-xs sm:text-sm">
                          &ldquo;{currentQuestion.word.example1}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 選択肢セクション */}
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className="w-full">
                      <div className="space-y-1 sm:space-y-2">
                        {currentQuestion.options.map((option, index) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrectOption = option === currentQuestion.correct_answer;
                          const isWrongSelected = isSelected && !isCorrect;
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full justify-start text-left h-auto p-2 sm:p-3 lg:p-4 text-xs sm:text-sm lg:text-base transition-all duration-200 min-h-[50px] sm:min-h-[60px] touch-target mobile-button ${
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
                              <div className="flex items-start justify-between w-full gap-2 sm:gap-3">
                                <span className="flex-1 text-left break-words leading-relaxed">{option}</span>
                                {showResult && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {isCorrectOption && (
                                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">正解</span>
                                      </div>
                                    )}
                                    {isWrongSelected && (
                                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">不正解</span>
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
              <Card className={`mb-2 sm:mb-3 flex-shrink-0 ${
                isCorrect 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
              }`}>
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="mb-1 sm:mb-2">
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-foreground mb-1">
                        正解: <span className="text-primary">{currentQuestion.correct_answer}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          あなたの回答: <span className="text-red-600 dark:text-red-400">{selectedAnswer}</span>
                        </p>
                      )}
                    </div>
                    {!isCorrect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddToReview}
                        className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm h-6 sm:h-8"
                      >
                        復習リストに追加
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 次へボタン - 固定位置 */}
        {showResult && (
          <div className="flex-shrink-0 p-2 border-t border-border bg-background">
            <div className="max-w-6xl mx-auto">
              <div className="text-center">
                <Button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 h-8 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-medium touch-target mobile-button"
                >
                  {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AudioInitializer>
  );
} 