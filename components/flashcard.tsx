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
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  
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

        // データベースからお気に入り状態を取得
        const { data, error } = await supabase
          .from('user_progress')
          .select('word_id')
          .eq('user_id', user.id)
          .eq('is_favorite', true);

        if (error) throw error;

        const favoriteIds = new Set(data?.map(item => item.word_id).filter((id): id is string => id !== null) || []);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('お気に入りの読み込みエラー:', error);
      }
    };

    loadFavorites();
  }, []);

  // 単語が変わったら例文の表示状態をリセット
  useEffect(() => {
    setFlippedExamples(new Set());
  }, [currentIndex]);

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

      // データベースでお気に入り状態を更新
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          word_id: currentWord.id,
          is_favorite: !isFavorite,
          mastery_level: 0,
          study_count: 0,
          correct_count: 0,
          incorrect_count: 0,
          last_studied: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // ローカル状態を更新
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

  const handleExampleClick = useCallback((exampleKey: string) => {
    setFlippedExamples(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exampleKey)) {
        newSet.delete(exampleKey);
      } else {
        newSet.add(exampleKey);
      }
      return newSet;
    });
  }, []);

  if (!currentWord) {
    return (
      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300">単語が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Progress Bar */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
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
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 min-h-0 mb-4">
        <Card className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-xl border-amber-200 dark:border-amber-700 transition-all duration-300 h-full smooth-hover">
          <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-center relative overflow-y-auto">
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 ${isFavorite ? 'text-yellow-500' : 'text-amber-400'} hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors z-10`}
            >
              {isFavorite ? <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <StarOff className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            {/* メインコンテンツ - 自動レイアウト */}
            <div className="flex flex-col xl:flex-row xl:gap-12 h-full max-w-7xl mx-auto w-full">
              {/* 左側：英単語と意味 */}
              <div className="xl:flex-1 flex flex-col justify-center text-center xl:text-left">
                {/* 英単語セクション */}
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-amber-800 dark:text-amber-200 mb-3 lg:mb-4">
                    {currentWord.word}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-amber-600 dark:text-amber-400 mb-4 lg:mb-6">
                    {currentWord.phonetic}
                  </p>
                  <Button
                    variant="outline"
                    onClick={playWordAudio}
                    className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-all px-6 py-3"
                  >
                    <Volume2 className="h-5 w-5 mr-2" />
                    発音を聞く
                  </Button>
                </div>

                {/* 日本語の意味 */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-amber-800 dark:text-amber-200">
                    {currentWord.japanese}
                  </h3>
                </div>
              </div>

              {/* 右側：例文セクション */}
              <div className="xl:flex-1 flex flex-col justify-center">
                <div className="space-y-3 lg:space-y-4 max-w-3xl mx-auto xl:mx-0 w-full">
                  {currentWord.example1 && (
                    <div 
                      className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 lg:p-5 border border-amber-200 dark:border-amber-600 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
                      onClick={() => handleExampleClick('example1')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example1') ? currentWord.example1 : currentWord.example1_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example1!);
                          }}
                          className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm lg:text-base">
                        {flippedExamples.has('example1') ? currentWord.example1_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}
                  
                  {currentWord.example2 && (
                    <div 
                      className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 lg:p-5 border border-amber-200 dark:border-amber-600 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
                      onClick={() => handleExampleClick('example2')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example2') ? currentWord.example2 : currentWord.example2_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example2!);
                          }}
                          className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm lg:text-base">
                        {flippedExamples.has('example2') ? currentWord.example2_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}
                  
                  {currentWord.example3 && (
                    <div 
                      className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 lg:p-5 border border-amber-200 dark:border-amber-600 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
                      onClick={() => handleExampleClick('example3')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example3') ? currentWord.example3 : currentWord.example3_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example3!);
                          }}
                          className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm lg:text-base">
                        {flippedExamples.has('example3') ? currentWord.example3_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0 max-w-7xl mx-auto w-full">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={currentIndex === 0} 
          className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20 px-6 py-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          前の単語
        </Button>
        
        <div className="w-full sm:w-auto flex justify-center">
          <Button 
            onClick={handleAddToReview} 
            disabled={isLoading || isAddedToReview} 
            className={`px-6 py-3 transition-all ripple ${
              isAddedToReview 
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' 
                : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800'
            } text-white`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isLoading ? '追加中...' : isAddedToReview ? '追加済み' : '復習リストに追加'}
          </Button>
        </div>
        
        <Button 
          onClick={handleNext} 
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 ripple"
        >
          {currentIndex === words.length - 1 ? '完了' : '次の単語'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 