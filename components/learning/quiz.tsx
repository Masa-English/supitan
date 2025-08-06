'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check, CheckCircle, Brain, ArrowRight, XCircle } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/common/audio-controls';
import { AudioInitializer } from './audio-initializer';

interface QuizProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onAddToReview: (wordId: string) => void;
  key?: string | number; // リセット用のキーを追加
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
        type: 'meaning',
        question: `${word.word}の意味を選んでください`
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
              type: 'example',
              question: `${selectedPair.en}の日本語訳を選んでください`
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
        // 既に問題が生成されている場合はスキップ
        if (questions.length > 0) {
          return undefined;
        }
        
        // タブ復元時は少し遅延して問題生成
        const timeoutId = setTimeout(() => {
          generateQuestions();
        }, 150);

        return () => clearTimeout(timeoutId);
      }
      return undefined;
    }
    return undefined;
  }, [generateQuestions, words.length, questions.length]);

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
        <div className="flex-shrink-0 p-1 sm:p-2 lg:p-3 border-b border-border bg-background">
          <div className="max-w-6xl mx-auto">
            {/* 進捗情報 */}
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* スマホでは問題番号を非表示 */}
                <span className="hidden sm:inline text-xs sm:text-sm lg:text-base font-medium text-foreground">
                  問題 {currentIndex + 1} / {questions.length}
                </span>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  {Math.round(progress)}% 完了
                </div>
              </div>
              
              {/* 音声コントロール */}
              <div className="flex items-center gap-1 sm:gap-2">
                <AudioControls />
                <Badge 
                  variant="outline" 
                  className="px-1 sm:px-2 py-1 border-primary text-primary bg-primary/10 text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {currentQuestion.type === 'meaning' ? '意味問題' : '例文問題'}
                </Badge>
              </div>
            </div>
            
            {/* 進捗バー */}
            <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div
                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* メインコンテンツ - スクロール可能なエリア */}
        <div className="flex-1 overflow-y-auto p-1 sm:p-2 lg:p-3">
          <div className="max-w-6xl mx-auto min-h-full flex flex-col">
            {/* 問題カード */}
            <div className="flex-1 mb-2 sm:mb-3">
              <Card className="bg-card border-border shadow-lg h-full">
                <CardContent className="p-2 sm:p-3 lg:p-4 h-full flex flex-col">
                   {/* 問題文セクション */}
                   <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
                     {/* 単語と音声ボタン */}
                     <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                       <div className="relative">
                         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                           {currentQuestion.word.word}
                         </h2>
                        </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={playAudio}
                         className="text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200 touch-target rounded-full p-1"
                       >
                         <Volume2 className="h-4 w-4" />
                       </Button>
                     </div>
                     
                     {/* 発音記号と音声ボタンを横並び */}
                     {currentQuestion.word.phonetic && (
                       <div className="mb-1 sm:mb-2 flex items-center justify-center gap-2">
                         <p className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-full">
                           /{currentQuestion.word.phonetic}/
                         </p>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={playAudio}
                           className="text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200 touch-target rounded-full p-1"
                         >
                           <Volume2 className="h-3 w-3" />
                         </Button>
                       </div>
                     )}
                     
                     {/* 問題文 */}
                     <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                       <p className="text-sm sm:text-base lg:text-lg text-foreground font-medium leading-relaxed">
                         {currentQuestion.question || (currentQuestion.type === 'meaning' ? `${currentQuestion.word.word}の意味を選んでください` : '正しい日本語訳を選んでください')}
                       </p>
                     </div>
                   </div>

                  {/* 選択肢 */}
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                        className={`w-full h-10 sm:h-12 text-left justify-start p-2 sm:p-3 text-sm sm:text-base font-medium transition-all duration-300 rounded-xl border-2 hover:shadow-md ${
                          selectedAnswer === option
                            ? option === currentQuestion.correct_answer
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-lg dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600 dark:text-green-300'
                              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800 shadow-lg dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-600 dark:text-red-300'
                            : 'hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:border-primary/50 hover:text-primary'
                        } touch-target group`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1 leading-relaxed">{option}</span>
                          </div>
                          {selectedAnswer === option && (
                            <div className="ml-2 sm:ml-3">
                              {option === currentQuestion.correct_answer ? (
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 animate-bounce" />
                              ) : (
                                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 animate-bounce" />
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
              <Card className={`mb-2 sm:mb-3 flex-shrink-0 border-2 ${
                isCorrect 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700'
              } shadow-lg`}>
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-border mb-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                        正解: <span className="text-primary font-bold">{currentQuestion.correct_answer}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-muted-foreground text-xs">
                          あなたの回答: <span className="text-red-600 dark:text-red-400 font-medium">{selectedAnswer}</span>
                        </p>
                      )}
                    </div>
                    {!isCorrect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddToReview}
                        className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm h-7 sm:h-9 rounded-lg"
                      >
                        <Brain className="h-3 w-3 mr-1 sm:mr-2" />
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
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground touch-target rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center"
            >
              {currentIndex === questions.length - 1 ? (
                <Check className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </AudioInitializer>
  );
} 