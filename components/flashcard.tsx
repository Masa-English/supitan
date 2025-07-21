'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Star, StarOff, CheckCircle } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/audio-controls';
import { createClient } from '@/lib/supabase/client';

interface FlashcardProps {
  words: Word[];
  onComplete: () => void;
  onAddToReview: (wordId: string) => void;
  category: string;
}

export function Flashcard({ words, onComplete, onAddToReview }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addedToReview, setAddedToReview] = useState<Set<string>>(new Set());
  
  const { speak, isEnabled } = useAudioStore();
  
  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const isFavorite = favorites.has(currentWord?.id || '');
  const isAddedToReview = addedToReview.has(currentWord?.id || '');

  // お気に入り状態を読み込み
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 仮実装：実際のお気に入り機能は後で実装
        setFavorites(new Set());
      } catch (error) {
        console.error('お気に入りの読み込みエラー:', error);
      }
    };

    loadFavorites();
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  }, [currentIndex, words.length, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleAddToReview = useCallback(async () => {
    if (!currentWord || isLoading || isAddedToReview) return;

    setIsLoading(true);
    try {
      await onAddToReview(currentWord.id);
      setAddedToReview(prev => new Set([...prev, currentWord.id]));
    } catch (error) {
      console.error('復習リストへの追加エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWord, onAddToReview, isLoading, isAddedToReview]);

  const handleToggleFavorite = useCallback(async () => {
    if (!currentWord) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 仮実装：お気に入り状態をローカルで管理
      if (isFavorite) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentWord.id);
          return newSet;
        });
      } else {
        setFavorites(prev => new Set([...prev, currentWord.id]));
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    }
  }, [currentWord, isFavorite]);

  const playWordAudio = useCallback(() => {
    if (currentWord && isEnabled) {
      speak(currentWord.word);
    }
  }, [currentWord, speak, isEnabled]);

  const playExampleAudio = useCallback((text: string) => {
    if (isEnabled) {
      speak(text);
    }
  }, [speak, isEnabled]);

  if (!currentWord) {
    return (
      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300">単語が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-amber-800 dark:text-amber-200">
              {currentIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <CheckCircle className="h-4 w-4" />
              {Math.round(progress)}% 完了
            </div>
          </div>
          <AudioControls showQuickControls={true} />
        </div>
        <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative mb-8">
        <Card className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-xl border-amber-200 dark:border-amber-700 transition-all duration-300 min-h-[500px]">
          <CardContent className="p-8 h-full flex flex-col justify-center relative">
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`absolute top-4 right-4 ${isFavorite ? 'text-yellow-500' : 'text-amber-400'} hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors`}
            >
              {isFavorite ? <Star className="h-6 w-6 fill-current" /> : <StarOff className="h-6 w-6" />}
            </Button>

            {/* 英単語セクション */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold text-amber-800 dark:text-amber-200 mb-4">
                {currentWord.word}
              </h2>
              <p className="text-xl text-amber-600 dark:text-amber-400 mb-6">
                {currentWord.phonetic}
              </p>
              <Button
                variant="outline"
                onClick={playWordAudio}
                className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-all"
              >
                <Volume2 className="h-5 w-5 mr-2" />
                発音を聞く
              </Button>
            </div>

            {/* 日本語の意味 */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-4">
                {currentWord.japanese}
              </h3>
            </div>

            {/* 例文セクション */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {currentWord.example1 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      {currentWord.example1}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playExampleAudio(currentWord.example1!)}
                      className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 ml-2"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    {currentWord.example1_jp}
                  </p>
                </div>
              )}
              
              {currentWord.example2 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      {currentWord.example2}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playExampleAudio(currentWord.example2!)}
                      className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 ml-2"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    {currentWord.example2_jp}
                  </p>
                </div>
              )}
              
              {currentWord.example3 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      {currentWord.example3}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playExampleAudio(currentWord.example3!)}
                      className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 ml-2"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    {currentWord.example3_jp}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={currentIndex === 0} 
          className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20 px-6 py-3"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          前の単語
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleAddToReview} 
            disabled={isLoading || isAddedToReview} 
            className={`px-6 py-3 transition-all ${
              isAddedToReview 
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' 
                : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800'
            } text-white`}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            {isLoading ? '追加中...' : isAddedToReview ? '追加済み' : '復習リストに追加'}
          </Button>
        </div>
        
        <Button 
          onClick={handleNext} 
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
        >
          {currentIndex === words.length - 1 ? '完了' : '次の単語'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
} 