'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    } else {
      onComplete();
    }
  }, [currentIndex, words.length, onComplete, onIndexChange]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, onIndexChange]);

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
      <div className="mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-foreground">
              {currentIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="h-4 w-4" />
              {Math.round(progress)}% 完了
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AudioControls className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm" />
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 rounded-full progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 min-h-0 mb-4">
        <Card className="bg-card border-border h-full">
          <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-center relative overflow-y-auto">
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 ${isFavorite ? 'text-primary' : 'text-muted-foreground'} z-10`}
            >
              {isFavorite ? <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <StarOff className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            {/* メインコンテンツ - 常に1列表示 */}
            <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
              {/* 英単語と意味セクション */}
              <div className="flex flex-col justify-center text-center">
                {/* 英単語セクション */}
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-3 lg:mb-4">
                    {currentWord.word}
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-4 lg:mb-6">
                    {currentWord.phonetic}
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={playWordAudio}
                      className="bg-primary/10 border-primary text-primary px-6 py-3"
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      発音を聞く
                    </Button>
                    
                    {/* 音声ファイルの状態表示（現在は無効化） */}
                    {/* 
                    {currentWord.audio_file && (
                      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                        {audioStatus.loading ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                            <span>音声ファイル確認中...</span>
                          </div>
                        ) : audioStatus.error ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>音声ファイルエラー</span>
                          </div>
                        ) : audioStatus.info?.audioInfo?.exists ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-3 w-3" />
                            <span>音声ファイル利用可能</span>
                          </div>
                        ) : audioStatus.info?.audioInfo ? (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>音声ファイル未発見</span>
                          </div>
                        ) : null}
                        
                        {process.env.NODE_ENV === 'development' && audioStatus.info && (
                          <details className="text-left max-w-xs">
                            <summary className="cursor-pointer text-blue-500 hover:text-blue-600">
                              デバッグ情報
                            </summary>
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                              <div><strong>単語:</strong> {audioStatus.info.word}</div>
                              <div><strong>音声ファイル:</strong> {audioStatus.info.audioFile}</div>
                              {audioStatus.info.audioInfo?.metadata && (
                                <>
                                  <div><strong>ファイル名:</strong> {audioStatus.info.audioInfo.metadata.name}</div>
                                  <div><strong>サイズ:</strong> {audioStatus.info.audioInfo.metadata.size} bytes</div>
                                  <div><strong>MIME:</strong> {audioStatus.info.audioInfo.metadata.mimeType}</div>
                                </>
                              )}
                              {audioStatus.info.error && (
                                <div className="text-red-500"><strong>エラー:</strong> {audioStatus.info.error}</div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                    */}
                  </div>
                </div>

                {/* 日本語の意味 - 初期表示では隠す */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleJapaneseDisplay}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showJapanese ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          意味を隠す
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          意味を表示
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {showJapanese && (
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                      {currentWord.japanese}
                    </h3>
                  )}
                </div>
              </div>

              {/* 例文セクション */}
              <div className="flex flex-col justify-center">
                <div className="space-y-3 lg:space-y-4 max-w-3xl mx-auto w-full">
                  {currentWord.example1 && (
                    <div 
                      className="bg-accent rounded-xl p-4 lg:p-5 border border-border cursor-pointer"
                      onClick={() => handleExampleClick('example1')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-foreground font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example1') ? currentWord.example1 : currentWord.example1_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example1!);
                          }}
                          className="text-primary h-8 w-8 p-2 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm lg:text-base">
                        {flippedExamples.has('example1') ? currentWord.example1_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}
                  
                  {currentWord.example2 && (
                    <div 
                      className="bg-accent rounded-xl p-4 lg:p-5 border border-border cursor-pointer"
                      onClick={() => handleExampleClick('example2')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-foreground font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example2') ? currentWord.example2 : currentWord.example2_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example2!);
                          }}
                          className="text-primary h-8 w-8 p-2 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm lg:text-base">
                        {flippedExamples.has('example2') ? currentWord.example2_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}
                  
                  {currentWord.example3 && (
                    <div 
                      className="bg-accent rounded-xl p-4 lg:p-5 border border-border cursor-pointer"
                      onClick={() => handleExampleClick('example3')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-foreground font-medium text-base lg:text-lg flex-1 pr-3 leading-relaxed">
                          {flippedExamples.has('example3') ? currentWord.example3 : currentWord.example3_jp}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playExampleAudio(currentWord.example3!);
                          }}
                          className="text-primary h-8 w-8 p-2 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm lg:text-base">
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0 max-w-7xl mx-auto w-full px-4 sm:px-0 relative z-20">
        {/* Mobile: Stack buttons vertically */}
        <div className="sm:hidden w-full space-y-3">
          {/* Previous Button - Mobile */}
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentIndex === 0} 
            className={`
              w-full px-6 py-4 h-14
              border-2 border-muted-foreground/20 text-muted-foreground
              hover:border-primary/30 hover:text-primary hover:bg-primary/5
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 ease-in-out
              group relative overflow-hidden touch-target
              ${currentIndex === 0 ? 'opacity-50' : 'hover:shadow-md'}
            `}
          >
            <ArrowLeft className="h-6 w-6 mr-3 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-base">前の単語</span>
          </Button>
          
          {/* Add to Review Button - Mobile */}
          <Button 
            onClick={handleAddToReview} 
            disabled={isLoading || isAddedToReview} 
            className={`
              w-full px-8 py-4 h-14 font-medium text-base
              transition-all duration-300 ease-in-out
              relative overflow-hidden group touch-target
              ${isAddedToReview 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg'
              }
              ${isLoading ? 'animate-pulse' : ''}
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            <RotateCcw className={`h-6 w-6 mr-3 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span>{isLoading ? '追加中...' : isAddedToReview ? '追加済み ✓' : '復習リストに追加'}</span>
          </Button>
          
          {/* Next Button - Mobile */}
          <Button 
            onClick={handleNext} 
            className={`
              w-full px-8 py-4 h-14 font-medium text-base
              bg-gradient-to-r from-primary to-primary/90 
              hover:from-primary/90 hover:to-primary
              text-primary-foreground shadow-lg hover:shadow-xl
              transition-all duration-200 ease-in-out
              group relative overflow-hidden touch-target
              ${currentIndex === words.length - 1 
                ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : ''
              }
            `}
          >
            <span className="font-medium">
              {currentIndex === words.length - 1 ? '完了' : '次の単語'}
            </span>
            <ArrowRight className={`h-6 w-6 ml-3 transition-transform group-hover:translate-x-1 ${currentIndex === words.length - 1 ? 'hidden' : ''}`} />
            {currentIndex === words.length - 1 && (
              <CheckCircle className="h-6 w-6 ml-3" />
            )}
          </Button>
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex flex-row justify-between items-center gap-4 w-full">
          {/* Previous Button */}
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentIndex === 0} 
            className={`
              w-full sm:w-auto px-6 py-3 h-12
              border-2 border-muted-foreground/20 text-muted-foreground
              hover:border-primary/30 hover:text-primary hover:bg-primary/5
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 ease-in-out
              group relative overflow-hidden
              ${currentIndex === 0 ? 'opacity-50' : 'hover:shadow-md'}
            `}
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">前の単語</span>
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
          </Button>
          
          {/* Add to Review Button */}
          <div className="w-full sm:w-auto flex justify-center">
            <Button 
              onClick={handleAddToReview} 
              disabled={isLoading || isAddedToReview} 
              className={`
                px-8 py-3 h-12 font-medium
                transition-all duration-300 ease-in-out
                relative overflow-hidden group
                ${isAddedToReview 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg'
                }
                ${isLoading ? 'animate-pulse' : ''}
                disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              <RotateCcw className={`h-5 w-5 mr-2 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span>{isLoading ? '追加中...' : isAddedToReview ? '追加済み ✓' : '復習リストに追加'}</span>
              {/* Success animation */}
              {isAddedToReview && (
                <div className="absolute inset-0 bg-green-400/20 animate-ping rounded-md" />
              )}
            </Button>
          </div>
          
          {/* Next Button */}
          <Button 
            onClick={handleNext} 
            className={`
              w-full sm:w-auto px-8 py-3 h-12 font-medium
              bg-gradient-to-r from-primary to-primary/90 
              hover:from-primary/90 hover:to-primary
              text-primary-foreground shadow-lg hover:shadow-xl
              transition-all duration-200 ease-in-out
              group relative overflow-hidden
              ${currentIndex === words.length - 1 
                ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : ''
              }
            `}
          >
            <span className="font-medium">
              {currentIndex === words.length - 1 ? '完了' : '次の単語'}
            </span>
            <ArrowRight className={`h-5 w-5 ml-2 transition-transform group-hover:translate-x-1 ${currentIndex === words.length - 1 ? 'hidden' : ''}`} />
            {currentIndex === words.length - 1 && (
              <CheckCircle className="h-5 w-5 ml-2" />
            )}
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
          </Button>
        </div>
      </div>
      </div>
    </AudioInitializer>
  );
} 