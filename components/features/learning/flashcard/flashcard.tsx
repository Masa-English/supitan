'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Volume2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { AudioControls } from '@/components/shared/audio-controls';
import { useAuth } from '@/lib/providers/auth-provider';
import { DatabaseService } from '@/lib/api/database';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { useAudioStore } from '@/lib/stores';

import { fetchAudioFromStorage } from '@/lib/utils/audio';
import { devLog } from '@/lib/utils';

// 例文音声パス生成（ローカルヘルパー）
function buildPathFromAudioFile(audioFilePath: string, index: number): string {
  const normalized = audioFilePath.replace(/\\/g, '/');
  const base = normalized.replace(/\/[^/]+$/, '').replace(/\/$/, '');
  const number = String(index).padStart(5, '0');
  return `${base}/example${number}.mp3`;
}

function buildPathFromWord(word: string, index: number): string {
  const number = String(index).padStart(5, '0');
  return `${word}/example${number}.mp3`;
}

interface FlashcardProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  category: string;
  onIndexChange?: (index: number) => void;
  key?: string | number; // リセット用のキーを追加
}

export function Flashcard({ words, onComplete, onIndexChange }: FlashcardProps) {
  console.log('Flashcard component loaded with words:', words.length);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviewWords, setReviewWords] = useState<Set<string>>(new Set());
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  const [showJapanese, setShowJapanese] = useState(true);
  
  // もう一度学習したい問題を記録する状態
  const [incorrectWords, setIncorrectWords] = useState<Word[]>([]);
  const [isInRetryMode, setIsInRetryMode] = useState(false);
  const [currentWordList, setCurrentWordList] = useState<Word[]>(words);

  const { volume, isMuted, playWordAudio: playWordAudioFromStore } = useAudioStore();
  const db = useMemo(() => new DatabaseService(), []);

  const currentWord = currentWordList[currentIndex];
  const total = Math.max(currentWordList.length, 1);
  const progress = ((currentIndex + 1) / total) * 100;

  const { user } = useAuth();

  // お気に入りと復習状態を読み込み
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user) return;

        const supabase = createBrowserClient();
        
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
  }, [db, favorites.size, reviewWords.size, user]);

  // 初期化時にcurrentWordListを設定
  useEffect(() => {
    setCurrentWordList(words);
    setCurrentIndex(0);
    setIncorrectWords([]);
    setIsInRetryMode(false);
  }, [words]);

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
    if (currentIndex < currentWordList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onIndexChange?.(currentIndex + 1);
    } else {
      // 現在のリストが終了した場合
      if (!isInRetryMode && incorrectWords.length > 0) {
        // 初回終了で間違えた問題がある場合、再出題モードに入る
        setIsInRetryMode(true);
        setCurrentWordList(incorrectWords);
        setCurrentIndex(0);
        setIncorrectWords([]); // リセット
      } else {
        // 再出題モードが終了、または間違えた問題がない場合
        // フラッシュカードでは全て正解として扱う（復習リストに追加されたものは別途処理）
        const results = words.map(word => ({
          wordId: word.id,
          correct: !incorrectWords.some(incorrect => incorrect.id === word.id)
        }));
        onComplete(results);
      }
    }
  }, [currentIndex, currentWordList.length, onComplete, onIndexChange, isInRetryMode, incorrectWords, words]);





  const playWordAudio = useCallback(() => {
    if (!currentWord) return;

    if (currentWord.audio_file) {
      console.log('[Flashcard] 単語音声再生開始', { wordId: currentWord.id, audioFile: currentWord.audio_file });
      // audio-storeのplayWordAudioを使用してキャッシュ機能を活用
      playWordAudioFromStore(currentWord.id);
    } else {
      console.log('[Flashcard] 単語に音声ファイルが設定されていない', { wordId: currentWord.id, word: currentWord.word });
    }
  }, [currentWord, playWordAudioFromStore]);

  const playExampleAudio = useCallback(async (
    _text: string,
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
      devLog.warn('例文音声の取得に失敗しました:', e);
    }
  }, [currentWord?.audio_file, volume, isMuted, currentWord?.word]);

  const handleExampleClick = useCallback((exampleKey: string) => {
    setFlippedExamples(prev => {
      const newSet = new Set(prev);
      const wasFlipped = newSet.has(exampleKey);

      if (wasFlipped) {
        newSet.delete(exampleKey);
      } else {
        newSet.add(exampleKey);
        // 日本語から英語に切り替えた時に自動で音声を再生
        const currentWord = currentWordList[currentIndex];
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
  }, [currentWordList, currentIndex, playExampleAudio]);

  const handleToggleJapanese = useCallback(() => {
    setShowJapanese(prev => !prev);
  }, []);

  // もう一度学習したい場合の処理
  const handleAddToRetry = useCallback(() => {
    if (!currentWord || isInRetryMode) return;

    // 再出題リストに追加
    setIncorrectWords(prev => [...prev, currentWord]);
    
    // 次の問題に進む
    handleNext();
  }, [currentWord, isInRetryMode, handleNext]);

  if (currentWordList.length === 0 || !currentWord) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">単語が0件です。前の画面に戻って条件を変更してください。</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col safe-bottom" style={{ minHeight: '100dvh' }}>
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 p-2 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm font-medium text-foreground">
                {currentIndex + 1} / {currentWordList.length}
                {isInRetryMode && <span className="text-orange-600 ml-2">(復習)</span>}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
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

                  {currentWord.example1_jp && (
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
                      <p className="text-muted-foreground text-sm">
                        {flippedExamples.has('example1') ? currentWord.example1_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}

                  {currentWord.example2_jp && (
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
                      <p className="text-muted-foreground text-sm">
                        {flippedExamples.has('example2') ? currentWord.example2_jp : 'クリックして英語を表示'}
                      </p>
                    </div>
                  )}

                  {currentWord.example3_jp && (
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
                      <p className="text-muted-foreground text-sm">
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
              variant="outline"
              onClick={handleAddToRetry}
              disabled={isInRetryMode}
              className="h-12 px-4 py-3 text-sm font-medium touch-target flex-1 max-w-[120px] text-orange-600 border-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">もう一度</span>
            </Button>

            <Button
              onClick={handleNext}
              className="h-12 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium touch-target flex-1 max-w-[120px]"
            >
              <span className="mr-2">
                {currentIndex === currentWordList.length - 1 ? '完了' : '次へ'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}