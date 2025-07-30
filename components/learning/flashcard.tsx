'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Star, StarOff, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AudioControls } from '@/components/common/audio-controls';
import { createClient } from '@/lib/supabase/client';
import { AudioInitializer } from './audio-initializer';
import { useAudioStore } from '@/lib/audio-store';
// import { getWordAudioInfo } from '@/lib/audio-utils';

interface FlashcardProps {
  words: Word[];
  onComplete: () => void;
  onAddToReview: (wordId: string) => void;
  category: string;
  onIndexChange?: (index: number) => void;
}

export function Flashcard({ words, onComplete, onAddToReview, onIndexChange }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addedToReview, setAddedToReview] = useState<Set<string>>(new Set());
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  const [showJapanese, setShowJapanese] = useState(false);
  // const [audioStatus, setAudioStatus] = useState<{
  //   loading: boolean;
  //   error: string | null;
  //   info: {
  //     wordId: string;
  //     word: string | null;
  //     audioFile: string | null;
  //     audioInfo: {
  //       exists: boolean;
  //       error: string | null;
  //       metadata: {
  //         name: string;
  //         size: number;
  //         mimeType: string;
  //         lastModified: string;
  //         path: string;
  //       } | null;
  //     } | null;
  //     error: string | null;
  //   } | null;
  // }>({ loading: false, error: null, info: null });

  
  const { volume, isMuted } = useAudioStore();
  
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

  // 単語が変わったら例文の表示状態と日本語表示状態をリセット
  useEffect(() => {
    setFlippedExamples(new Set());
    setShowJapanese(false);
  }, [currentIndex]);

  // 音声ファイルの初期化 - 一時的に無効化（動的読み込みに変更）
  // useEffect(() => {
  //   const initializeAudioFiles = async () => {
  //     console.log(`[Flashcard] 音声ファイル初期化開始: ${words.length}個の単語`);
      
  //     for (const word of words) {
  //       if (word.audio_file) {
  //         console.log(`[Flashcard] 音声ファイル初期化: ${word.word} (${word.audio_file})`);
  //         try {
  //           // 新しい音声ストアの機能を使用して音声ファイルを読み込み
  //           await loadWordAudio(word.id, word.audio_file);
  //           console.log(`[Flashcard] 音声ファイル初期化成功: ${word.word}`);
  //         } catch (error) {
  //           console.warn(`[Flashcard] 音声ファイルの読み込みに失敗しました: ${word.word} (${word.audio_file})`, error);
  //           }
  //       } else {
  //         console.log(`[Flashcard] 音声ファイルなし: ${word.word}`);
  //       }
  //     }
      
  //     console.log(`[Flashcard] 音声ファイル初期化完了`);
  //   };

  //   initializeAudioFiles();
  // }, [words]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onIndexChange?.(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onIndexChange?.(currentIndex + 1);
    } else {
      onComplete();
    }
  }, [currentIndex, words.length, onComplete, onIndexChange]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setFlippedExamples(new Set());
    setShowJapanese(false);
    onIndexChange?.(0);
  }, [onIndexChange]);

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

  const fallbackToSpeechSynthesis = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = volume;
      speechSynthesis.speak(utterance);
    }
  }, [volume]);

  const playWordAudio = useCallback(async () => {
    if (!currentWord?.word || isMuted) return;

    console.log(`[Flashcard] 音声再生開始: ${currentWord.word}, audio_file=${currentWord.audio_file}`);

    // 音声ファイルがある場合は音声ファイルを再生
    if (currentWord.audio_file) {
      console.log(`[Flashcard] 音声ファイルを再生: ${currentWord.audio_file}`);
      const { playWordAudio: playAudio } = useAudioStore.getState();
      await playAudio(currentWord.id);
    } else {
      console.log(`[Flashcard] Web Speech APIを使用: ${currentWord.word}`);
      // 音声ファイルがない場合はWeb Speech APIを使用
      fallbackToSpeechSynthesis(currentWord.word);
    }
  }, [currentWord, isMuted, fallbackToSpeechSynthesis]);

  const playExampleAudio = useCallback((text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = volume;
      speechSynthesis.speak(utterance);
    }
  }, [isMuted, volume]);

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

  const toggleJapaneseDisplay = useCallback(() => {
    setShowJapanese(prev => !prev);
  }, []);

  // 音声ファイルの状態を確認する関数（現在は使用されていない）
  // const checkAudioStatus = useCallback(async (word: Word) => {
  //   if (!word) return;
    
  //   console.log(`[Flashcard] 音声ファイル状態確認開始: ${word.word} (${word.id})`);
    
  //   setAudioStatus(prev => ({ ...prev, loading: true, error: null }));
    
  //   try {
  //     const audioInfo = await getWordAudioInfo(word.id);
  //     console.log(`[Flashcard] 音声ファイル状態確認結果:`, audioInfo);
      
  //     setAudioStatus({
  //       loading: false,
  //       error: null,
  //       info: audioInfo
  //     });
  //   } catch (error) {
  //     console.error(`[Flashcard] 音声ファイル状態確認エラー:`, error);
  //     setAudioStatus({
  //       loading: false,
  //       error: error instanceof Error ? error.message : '音声ファイルの確認に失敗しました',
  //       info: null
  //     });
  //   }
  // }, []); // 依存配列を空にする

  // 現在の単語が変わったら音声ファイルの状態を確認 - 一時的に無効化
  // useEffect(() => {
  //   if (currentWord?.audio_file) {
  //     checkAudioStatus(currentWord);
  //   } else {
  //     setAudioStatus({ loading: false, error: null, info: null });
  //   }
  // }, [currentWord, checkAudioStatus]);

  if (!currentWord) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">単語が見つかりません</p>
      </div>
    );
  }

  return (
    <AudioInitializer>
      <div className="h-full flex flex-col footer-safe">
      {/* Progress and Audio Controls */}
      <div className="mb-3 flex-shrink-0">
        {/* 進捗情報 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-lg font-medium text-foreground">
              {currentIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-primary">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              {Math.round(progress)}% 完了
            </div>
          </div>
          
          {/* 音声コントロール */}
          <AudioControls />
        </div>
        
        {/* 進捗バー */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          {/* Word Section */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                {currentWord.word}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={playWordAudio}
                className="text-primary hover:bg-accent"
              >
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-3 sm:mb-4">
              {currentWord.phonetic}
            </p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`h-8 w-8 p-0 ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
              >
                {isFavorite ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToReview}
                className={`h-8 w-8 p-0 ${isAddedToReview ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Japanese Meaning Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleJapaneseDisplay}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                {showJapanese ? (
                  <>
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    意味を隠す
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    意味を表示
                  </>
                )}
              </Button>
            </div>
            
            {showJapanese && (
              <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">
                {currentWord.japanese}
              </h3>
            )}
          </div>

          {/* Examples Section */}
          <div className="flex flex-col justify-center">
            <div className="space-y-2 sm:space-y-3 max-w-3xl mx-auto w-full">
              {currentWord.example1 && (
                <div 
                  className="bg-accent rounded-xl p-3 sm:p-4 border border-border cursor-pointer"
                  onClick={() => handleExampleClick('example1')}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <p className="text-foreground font-medium text-sm sm:text-base lg:text-lg flex-1 pr-2 sm:pr-3 leading-relaxed">
                      {flippedExamples.has('example1') ? currentWord.example1 : currentWord.example1_jp}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playExampleAudio(currentWord.example1!);
                      }}
                      className="text-primary h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-2 flex-shrink-0"
                    >
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                    {flippedExamples.has('example1') ? currentWord.example1_jp : 'クリックして英語を表示'}
                  </p>
                </div>
              )}
              
              {currentWord.example2 && (
                <div 
                  className="bg-accent rounded-xl p-3 sm:p-4 border border-border cursor-pointer"
                  onClick={() => handleExampleClick('example2')}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <p className="text-foreground font-medium text-sm sm:text-base lg:text-lg flex-1 pr-2 sm:pr-3 leading-relaxed">
                      {flippedExamples.has('example2') ? currentWord.example2 : currentWord.example2_jp}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playExampleAudio(currentWord.example2!);
                      }}
                      className="text-primary h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-2 flex-shrink-0"
                    >
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                    {flippedExamples.has('example2') ? currentWord.example2_jp : 'クリックして英語を表示'}
                  </p>
                </div>
              )}
              
              {currentWord.example3 && (
                <div 
                  className="bg-accent rounded-xl p-3 sm:p-4 border border-border cursor-pointer"
                  onClick={() => handleExampleClick('example3')}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <p className="text-foreground font-medium text-sm sm:text-base lg:text-lg flex-1 pr-2 sm:pr-3 leading-relaxed">
                      {flippedExamples.has('example3') ? currentWord.example3 : currentWord.example3_jp}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playExampleAudio(currentWord.example3!);
                      }}
                      className="text-primary h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-2 flex-shrink-0"
                    >
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                    {flippedExamples.has('example3') ? currentWord.example3_jp : 'クリックして英語を表示'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-4 sm:mt-6 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-10 sm:h-12 px-3 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">前へ</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-10 sm:h-12 px-3 sm:px-4"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">リセット</span>
          </Button>
          
          <Button
            onClick={handleNext}
            className="h-10 sm:h-12 px-3 sm:px-4 bg-primary hover:bg-primary/90"
          >
            <span className="text-xs sm:text-sm mr-1 sm:mr-2">
              {currentIndex === words.length - 1 ? '完了' : '次へ'}
            </span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
    </AudioInitializer>
  );
} 