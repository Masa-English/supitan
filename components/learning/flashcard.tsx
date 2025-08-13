'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Volume2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { AudioControls } from '@/components/common/audio-controls';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { AudioInitializer } from './audio-initializer';
import { useAudioStore } from '@/lib/audio-store';
import { useToast } from '@/components/ui/toast';
import { fetchAudioFromStorage } from '@/lib/audio-utils';
import { devLog } from '@/lib/utils';

// 例文音声パス生成（ローカルヘルパー）
function buildPathFromAudioFile(audioFilePath: string, index: number): string {
  const normalized = audioFilePath.replace(/\\/g, '/');
  const base = normalized.replace(/\/[^/]+$/, '').replace(/\/$/, '');
  const number = String(index).padStart(3, '0');
  return `${base}/example${number}.mp3`;
}

function buildPathFromWord(word: string, index: number): string {
  const number = String(index).padStart(3, '0');
  return `${word}/example${number}.mp3`;
}

interface FlashcardProps {
  words: Word[];
  onComplete: () => void;
  category: string;
  onIndexChange?: (index: number) => void;
  key?: string | number; // リセット用のキーを追加
}

export function Flashcard({ words, onComplete, onIndexChange }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviewWords, setReviewWords] = useState<Set<string>>(new Set());
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  const [showJapanese, setShowJapanese] = useState(false);
  
  const { volume, isMuted, playWordAudio: playWordAudioFromStore } = useAudioStore();
  const db = useMemo(() => new DatabaseService(), []);
  const { showToast } = useToast();
  
  const currentWord = words[currentIndex];
  const total = Math.max(words.length, 1);
  const progress = ((currentIndex + 1) / total) * 100;
  const isInReview = reviewWords.has(currentWord?.id || '');

  // お気に入りと復習状態を読み込み
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient();
        
        let user = null;
        try {
          const { data: { user: userData }, error } = await supabase.auth.getUser();
          if (error) {
            const message = String((error as { message?: string }).message || '');
            const code = String((error as { code?: string }).code || '');
            const isExpected =
              message.includes('Refresh Token Not Found') ||
              message.includes('Invalid Refresh Token') ||
              message.includes('Auth session missing') ||
              code === 'refresh_token_not_found';
            if (!isExpected && process.env.NODE_ENV === 'development') {
              console.error('ユーザー取得エラー:', error);
            }
            return;
          }
          if (userData) {
            user = userData;
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('Session check skipped for user data loading', e);
          }
          return;
        }
        
        if (!user) return;

        // お気に入りを取得
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('word_id, is_favorite')
          .eq('user_id', user.id)
          .eq('is_favorite', true);

        if (progressError) throw progressError;

        const favoriteIds = new Set<string>();
        progressData?.forEach(item => {
          if (item.word_id) {
            favoriteIds.add(item.word_id);
          }
        });

        // 復習状態を取得
        const reviewWordsData = await db.getReviewWords(user.id);
        const reviewIds = new Set<string>();
        reviewWordsData.forEach(item => {
          if (item.word_id) {
            reviewIds.add(item.word_id);
          }
        });

        setFavorites(favoriteIds);
        setReviewWords(reviewIds);
      } catch (error) {
        console.error('ユーザーデータの読み込みエラー:', error);
      }
    };

    // ユーザーデータが既に読み込まれている場合はスキップ
    if (favorites.size > 0 || reviewWords.size > 0) {
      return undefined;
    }

    // タブ復元時は少し遅延して読み込み
    const timeoutId = setTimeout(() => {
      loadUserData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [db, favorites.size, reviewWords.size]);

  // 単語が変わったら例文の表示状態と日本語表示状態をリセット
  useEffect(() => {
    setFlippedExamples(new Set());
    setShowJapanese(false);
  }, [currentIndex]);

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

  const handleToggleReview = useCallback(async () => {
    if (!currentWord) return;

    try {
      const supabase = createClient();
      
      let user = null;
      try {
        const { data: { user: userData }, error } = await supabase.auth.getUser();
        if (error) {
          const message = String((error as { message?: string }).message || '');
          const code = String((error as { code?: string }).code || '');
          const isExpected =
            message.includes('Refresh Token Not Found') ||
            message.includes('Invalid Refresh Token') ||
            message.includes('Auth session missing') ||
            code === 'refresh_token_not_found';
          if (!isExpected && process.env.NODE_ENV === 'development') {
            console.error('ユーザー取得エラー:', error);
          }
          return;
        }
        if (userData) {
          user = userData;
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Session check skipped for review toggle', e);
        }
        return;
      }
      
      if (!user) return;

      if (isInReview) {
        // 復習から削除
        await db.removeFromReview(user.id, currentWord.id);

        setReviewWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentWord.id);
          return newSet;
        });

        // 復習から削除のtoast通知
        showToast(`${currentWord.word} を復習から削除しました`, {
          type: 'info',
          title: '復習から削除'
        });
      } else {
        // 復習に追加
        await db.addToReview(user.id, currentWord.id);

        setReviewWords(prev => new Set([...prev, currentWord.id]));

        // 復習に追加のtoast通知
        showToast(`${currentWord.word} を復習に追加しました`, {
          type: 'success',
          title: '復習に追加'
        });
      }
    } catch (error) {
      console.error('復習操作エラー:', error);
      
      // エラー時のtoast通知
      showToast('復習の操作に失敗しました', {
        type: 'error',
        title: 'エラー'
      });
    }
  }, [currentWord, isInReview, db, showToast]);

  // お気に入り切り替え（現在UI非表示のため未使用）

  const fallbackToSpeechSynthesis = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const playWordAudio = useCallback(() => {
    if (!currentWord) return;

    if (currentWord.audio_file) {
      // audio-storeのplayWordAudioを使用してキャッシュ機能を活用
      playWordAudioFromStore(currentWord.id);
    } else {
      fallbackToSpeechSynthesis(currentWord.word);
    }
  }, [currentWord, playWordAudioFromStore, fallbackToSpeechSynthesis]);

  const playExampleAudio = useCallback(async (
    text: string,
    exampleIndex?: 1 | 2 | 3,
    _lang: 'en' | 'jp' = 'en'
  ) => {
    // ストレージ優先で取得し、失敗時にTTSへフォールバック
    try {
      if (exampleIndex) {
        // 1) words.audio_file がある場合はそのフォルダを基準に探す
        if (currentWord?.audio_file) {
          const path = buildPathFromAudioFile(currentWord.audio_file, exampleIndex);
          console.log('[Flashcard] Try example audio (by audio_file):', path);
          const blob = await fetchAudioFromStorage(path);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.volume = isMuted ? 0 : volume;
            await audio.play();
            return;
          }
        }

        // 2) audio_file 未設定時は英単語フォルダ直下を探す（例: "break up/example001.mp3"）
        if (currentWord?.word) {
          const fallbackPath = buildPathFromWord(currentWord.word, exampleIndex);
          console.log('[Flashcard] Try example audio (by word):', fallbackPath);
          const blob2 = await fetchAudioFromStorage(fallbackPath);
          if (blob2) {
            const url = URL.createObjectURL(blob2);
            const audio = new Audio(url);
            audio.volume = isMuted ? 0 : volume;
            await audio.play();
            return;
          }
        }
      }
    } catch (e) {
      devLog.warn('例文音声の取得に失敗。TTSへフォールバックします:', e);
    }
    try {
      fallbackToSpeechSynthesis(text);
    } catch (error) {
      console.error('例文音声再生エラー:', error);
    }
  }, [currentWord?.audio_file, volume, isMuted, fallbackToSpeechSynthesis, currentWord?.word]);


  const handleExampleClick = useCallback((exampleKey: string) => {
    setFlippedExamples(prev => {
      const newSet = new Set(prev);
      const wasFlipped = newSet.has(exampleKey);
      
      if (wasFlipped) {
        newSet.delete(exampleKey);
      } else {
        newSet.add(exampleKey);
        // 日本語から英語に切り替えた時に自動で音声を再生
        const currentWord = words[currentIndex];
        if (currentWord) {
          let exampleText = '';
          let exampleIndex: 1 | 2 | 3 | undefined;
          
          switch (exampleKey) {
            case 'example1':
              exampleText = currentWord.example1 || '';
              exampleIndex = 1;
              break;
            case 'example2':
              exampleText = currentWord.example2 || '';
              exampleIndex = 2;
              break;
            case 'example3':
              exampleText = currentWord.example3 || '';
              exampleIndex = 3;
              break;
          }
          
          if (exampleText) {
            // 少し遅延させてから音声を再生（UIの切り替えが完了してから）
            setTimeout(() => {
              playExampleAudio(exampleText, exampleIndex, 'en');
            }, 100);
          }
        }
      }
      
      return newSet;
    });
  }, [words, currentIndex, playExampleAudio]);

  const handleToggleJapanese = useCallback(() => {
    setShowJapanese(prev => !prev);
  }, []);

  if (words.length === 0 || !currentWord) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">単語が0件です。前の画面に戻って条件を変更してください。</p>
      </div>
    );
  }

  return (
    <AudioInitializer>
      <div className="h-screen flex flex-col safe-bottom" style={{ minHeight: '100dvh' }}>
        {/* ヘッダー部分 */}
        <div className="flex-shrink-0 p-2 border-b border-border bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {currentIndex + 1} / {words.length}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {Math.round(progress)}% 完了
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <AudioControls />
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          <div className="max-w-6xl mx-auto w-full h-auto flex flex-col">
            <div className="flex-1 flex items-center justify-center min-h-0 pb-6 sm:pb-0">
              <div className="w-full max-h-full overflow-y-auto">
                <div className="bg-card border border-border shadow-lg rounded-xl mt-2 p-4 relative">
                  {/* お気に入りボタンのみ残す */}
                  {/* <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleFavorite}
                      className={`h-8 w-8 p-0 touch-target ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                      title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                    >
                      {isFavorite ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </div> */}

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

                  {/* 意味セクション */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">意味</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleJapanese}
                        className="text-muted-foreground hover:text-foreground touch-target"
                      >
                        {showJapanese ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                                         {showJapanese && (
                       <div className="bg-accent rounded-lg p-3 border border-border">
                         <p className="text-foreground font-medium leading-relaxed">
                           {currentWord.japanese}
                         </p>
                       </div>
                     )}
                  </div>

                  {/* 例文セクション */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">例文</h3>
                    
                                         {currentWord.example1 && (
                       <div 
                         className="bg-accent rounded-lg p-3 border border-border cursor-pointer"
                         onClick={() => handleExampleClick('example1')}
                       >
                         <div className="flex items-center justify-between mb-1">
                           <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                             {flippedExamples.has('example1') ? currentWord.example1 : currentWord.example1_jp}
                           </p>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               playExampleAudio(
                                 flippedExamples.has('example1') ? currentWord.example1! : currentWord.example1_jp!,
                                 1,
                                 flippedExamples.has('example1') ? 'en' : 'jp'
                               );
                             }}
                             className="text-primary h-8 w-8 p-1 flex-shrink-0 flex items-center justify-center"
                           >
                             <Volume2 className="h-4 w-4" />
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
                         <div className="flex items-center justify-between mb-1">
                           <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                             {flippedExamples.has('example2') ? currentWord.example2 : currentWord.example2_jp}
                           </p>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               playExampleAudio(
                                 flippedExamples.has('example2') ? currentWord.example2! : currentWord.example2_jp!,
                                 2,
                                 flippedExamples.has('example2') ? 'en' : 'jp'
                               );
                             }}
                             className="text-primary h-8 w-8 p-1 flex-shrink-0 flex items-center justify-center"
                           >
                             <Volume2 className="h-4 w-4" />
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
                         <div className="flex items-center justify-between mb-1">
                           <p className="text-foreground font-medium text-sm flex-1 pr-2 leading-relaxed">
                             {flippedExamples.has('example3') ? currentWord.example3 : currentWord.example3_jp}
                           </p>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               playExampleAudio(
                                 flippedExamples.has('example3') ? currentWord.example3! : currentWord.example3_jp!,
                                 3,
                                 flippedExamples.has('example3') ? 'en' : 'jp'
                               );
                             }}
                             className="text-primary h-8 w-8 p-1 flex-shrink-0 flex items-center justify-center"
                           >
                             <Volume2 className="h-4 w-4" />
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
            
            {/* ナビゲーションボタン */}
            <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-4 py-3 sm:py-4 px-2 mt-auto sm:mt-0 safe-bottom">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="h-12 px-4 py-3 text-sm font-medium touch-target flex-1 max-w-[120px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">前へ</span>
              </Button>
              
              <Button
                variant={isInReview ? "outline" : "outline"}
                onClick={handleToggleReview}
                className={`h-12 px-4 py-3 text-sm font-medium touch-target flex-1 max-w-[120px] ${
                  isInReview ? 'text-blue-600 border-blue-600 hover:bg-blue-50' : 'text-muted-foreground'
                }`}
              >
                <BookOpen className={`h-4 w-4 mr-2 ${isInReview ? 'text-blue-600' : ''}`} />
                <span className="hidden sm:inline">
                  {isInReview ? '復習から削除' : '復習に追加'}
                </span>
              </Button>
              
              <Button
                onClick={handleNext}
                className="h-12 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium touch-target flex-1 max-w-[120px]"
              >
                <span className="mr-2">
                  {currentIndex === words.length - 1 ? '完了' : '次へ'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AudioInitializer>
  );
} 