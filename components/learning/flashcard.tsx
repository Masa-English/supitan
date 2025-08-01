'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Star, StarOff, Eye, EyeOff } from 'lucide-react';
import { AudioControls } from '@/components/common/audio-controls';
import { createClient } from '@/lib/supabase/client';
import { AudioInitializer } from './audio-initializer';
import { useAudioStore } from '@/lib/audio-store';
// import { getWordAudioInfo } from '@/lib/audio-utils';

interface FlashcardProps {
  words: Word[];
  onComplete: () => void;
  category: string;
  onIndexChange?: (index: number) => void;
}

export function Flashcard({ words, onComplete, onIndexChange }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
  //       name: string;
  //       size: number;
  //       mimeType: string;
  //       lastModified: string;
  //       path: string;
  //     } | null;
  //   } | null;
  // }>({ loading: false, error: null, info: null });

  
  const { volume, isMuted } = useAudioStore();
  
  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const isFavorite = favorites.has(currentWord?.id || '');

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
      <div className="h-screen flex flex-col" style={{ minHeight: '100dvh' }}>
        {/* ヘッダー部分 - レスポンシブ対応進捗表示 */}
        <div className="flex-shrink-0 p-2 border-b border-border bg-background">
          <div className="max-w-6xl mx-auto">
            {/* 進捗情報 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {currentIndex + 1} / {words.length}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {Math.round(progress)}% 完了
                </div>
              </div>
              
              {/* 音声コントロール */}
              <div className="flex items-center gap-1 sm:gap-2">
                <AudioControls />
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

        {/* メインコンテンツ - ビューポート対応レイアウト */}
        <div className="flex flex-col p-2 justify-around">
          <div className="max-w-6xl mx-auto w-full h-auto flex flex-col">
            {/* 単語カード - 適切な余白を確保 */}
            <div className="flex-1 flex items-center justify-center min-h-0 pb-6 sm:pb-0">
              <div className="w-full max-h-full overflow-y-auto">
                <div className="bg-card border border-border shadow-lg rounded-xl p-4 relative">
                  {/* 星マークを右上に配置 */}
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleFavorite}
                      className={`h-8 w-8 p-0 touch-target ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    >
                      {isFavorite ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* 単語セクション */}
                  <div className="text-center mb-3">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                        {currentWord.word}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playWordAudio}
                        className="text-primary hover:bg-accent touch-target"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {currentWord.phonetic}
                    </p>
                  </div>

                  {/* 日本語意味セクション */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleJapaneseDisplay}
                        className="text-muted-foreground hover:text-foreground text-sm"
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
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground text-center">
                        {currentWord.japanese}
                      </h3>
                    )}
                  </div>

                  {/* 例文セクション */}
                  <div className="space-y-2">
                    {currentWord.example1 && (
                      <div 
                        className="bg-accent rounded-lg p-3 border border-border cursor-pointer"
                        onClick={() => handleExampleClick('example1')}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                            {flippedExamples.has('example1') ? currentWord.example1 : currentWord.example1_jp}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              playExampleAudio(currentWord.example1!);
                            }}
                            className="text-primary h-6 w-6 p-1 flex-shrink-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {flippedExamples.has('example1') ? currentWord.example1_jp : 'クリックして英語を表示'}
                        </p>
                      </div>
                    )}
                    
                    {currentWord.example2 && (
                      <div 
                        className="bg-accent rounded-lg p-3 border border-border cursor-pointer"
                        onClick={() => handleExampleClick('example2')}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                            {flippedExamples.has('example2') ? currentWord.example2 : currentWord.example2_jp}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              playExampleAudio(currentWord.example2!);
                            }}
                            className="text-primary h-6 w-6 p-1 flex-shrink-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {flippedExamples.has('example2') ? currentWord.example2_jp : 'クリックして英語を表示'}
                        </p>
                      </div>
                    )}
                    
                    {currentWord.example3 && (
                      <div 
                        className="bg-accent rounded-lg p-3 border border-border cursor-pointer"
                        onClick={() => handleExampleClick('example3')}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                            {flippedExamples.has('example3') ? currentWord.example3 : currentWord.example3_jp}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              playExampleAudio(currentWord.example3!);
                            }}
                            className="text-primary h-6 w-6 p-1 flex-shrink-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {flippedExamples.has('example3') ? currentWord.example3_jp : 'クリックして英語を表示'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* ナビゲーションボタン - ビューポート対応 */}
            <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-4 py-3 sm:py-4 px-2 mt-auto sm:mt-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="h-10 sm:h-12 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium touch-target"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">前へ</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-10 sm:h-12 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium touch-target"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">リセット</span>
              </Button>
              
              <Button
                onClick={handleNext}
                className="h-10 sm:h-12 px-3 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-medium touch-target"
              >
                <span className="mr-1 sm:mr-2">
                  {currentIndex === words.length - 1 ? '完了' : '次へ'}
                </span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AudioInitializer>
  );
} 