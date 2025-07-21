'use client';

import { useState, useEffect } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Play } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/audio-controls';

interface FlashcardProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onAddToReview: (wordId: string) => void;
}

export function Flashcard({
  words,
  onComplete,
  onAddToReview
}: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentWord = words[currentIndex];
  const { speak, isEnabled } = useAudioStore();

  useEffect(() => {
    setIsFlipped(false);
    setShowAnswer(false);
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(results);
    }
  };

  const handleAddToReview = () => {
    onAddToReview(currentWord.id);
  };

  const playWordAudio = () => {
    if (isEnabled && currentWord) {
      speak(currentWord.word);
    }
  };

  const playSentenceAudio = (sentence: string) => {
    if (isEnabled) {
      speak(sentence);
    }
  };

  if (!currentWord) {
    return (
      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300">単語が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗表示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentIndex + 1} / {words.length}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
              1x
            </Badge>
            <AudioControls />
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* フラッシュカード */}
      <Card 
        className={`relative cursor-pointer transition-all duration-300 transform ${
          isFlipped ? 'rotate-y-180' : ''
        } bg-white dark:bg-gray-800 hover:shadow-lg border-gray-200 dark:border-gray-700`}
        onClick={handleFlip}
      >
        <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center">
          {!isFlipped ? (
            // 表面（日本語）
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                {currentWord.japanese}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                タップして英語を確認
              </p>
            </div>
          ) : (
            // 裏面（英語）
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {currentWord.word}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playWordAudio();
                  }}
                  className="text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {currentWord.phonetic}
              </p>
              
              {/* 発音ボタン */}
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  playWordAudio();
                }}
                className="w-full mb-6 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                発音を聞く
              </Button>

              {/* 例文 */}
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{currentWord.example1_jp}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentWord.example1}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSentenceAudio(currentWord.example1);
                      }}
                      className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{currentWord.example2_jp}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentWord.example2}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSentenceAudio(currentWord.example2);
                      }}
                      className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{currentWord.example3_jp}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentWord.example3}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSentenceAudio(currentWord.example3);
                      }}
                      className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          前へ
        </Button>

        <div className="flex gap-2">
          {isFlipped && (
            <Button
              onClick={handleAddToReview}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              復習
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          次へ
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 