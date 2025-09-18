/**
 * フラッシュカード用のカスタムフック
 * 状態管理とビジネスロジックを分離
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { DatabaseService } from '@/lib/api/database';
import { useAudioStore } from '@/lib/stores/audio-store';
// Audio storage utilities (placeholder implementation)
const fetchAudioFromStorage = async (path: string): Promise<Blob | null> => {
  try {
    const response = await fetch(`/audio/${path}`);
    if (response.ok) {
      return await response.blob();
    }
  } catch (error) {
    console.warn('Failed to fetch audio:', error);
  }
  return null;
};

const buildPathFromWord = (word: string, exampleIndex: 1 | 2 | 3): string => {
  return `${encodeURIComponent(word)}/example${String(exampleIndex).padStart(3, '0')}.mp3`;
};

// Dev log utility (placeholder implementation)
const devLog = {
  log: (...args: unknown[]) => console.log(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
};
import type { Word } from '@/lib/types';

export interface UseFlashcardReturn {
  // 状態
  currentIndex: number;
  favorites: Set<string>;
  reviewWords: Set<string>;
  flippedExamples: Set<string>;
  showJapanese: boolean;
  incorrectWords: Word[];
  isInRetryMode: boolean;
  currentWordList: Word[];
  
  // 計算値
  currentWord: Word | null;
  total: number;
  progress: number;
  canGoBack: boolean;
  canGoNext: boolean;
  
  // アクション
  goToNext: () => void;
  goToPrevious: () => void;
  toggleFavorite: (wordId: string) => void;
  toggleReviewWord: (wordId: string) => void;
  toggleJapanese: () => void;
  handleExampleClick: (exampleKey: string) => void;
  addToRetry: () => void;
  playWordAudio: () => Promise<void>;
  playExampleAudio: (text: string, index: 1 | 2 | 3, lang: 'en' | 'ja') => Promise<void>;
  completeSession: () => void;
}

export function useFlashcard(
  words: Word[],
  onComplete?: (results: { incorrectWords: Word[] }) => void,
  onIndexChange?: (index: number) => void
): UseFlashcardReturn {
  // 基本状態
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviewWords, setReviewWords] = useState<Set<string>>(new Set());
  const [flippedExamples, setFlippedExamples] = useState<Set<string>>(new Set());
  const [showJapanese, setShowJapanese] = useState(false);
  const [incorrectWords, setIncorrectWords] = useState<Word[]>([]);
  const [isInRetryMode, setIsInRetryMode] = useState(false);
  const [currentWordList, setCurrentWordList] = useState<Word[]>(words);

  // オーディオストア
  const { volume, isMuted } = useAudioStore();
  const _db = useMemo(() => new DatabaseService(), []);

  // 計算値
  const currentWord = currentWordList[currentIndex] || null;
  const total = Math.max(currentWordList.length, 1);
  const progress = ((currentIndex + 1) / total) * 100;
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < currentWordList.length - 1;

  // インデックス変更のコールバック
  const handleIndexChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    onIndexChange?.(newIndex);
    
    // 例文の表示状態をリセット
    setFlippedExamples(new Set());
  }, [onIndexChange]);

  // ナビゲーション
  const goToNext = useCallback(() => {
    if (canGoNext) {
      handleIndexChange(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, handleIndexChange]);

  const goToPrevious = useCallback(() => {
    if (canGoBack) {
      handleIndexChange(currentIndex - 1);
    }
  }, [canGoBack, currentIndex, handleIndexChange]);

  // お気に入り管理 (簡素化実装)
  const toggleFavorite = useCallback(async (wordId: string) => {
    try {
      const isFavorite = favorites.has(wordId);
      
      // TODO: 実際のデータベース更新を実装
      if (isFavorite) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordId);
          return newSet;
        });
      } else {
        setFavorites(prev => new Set(prev).add(wordId));
      }
    } catch (error) {
      console.error('お気に入りの更新に失敗:', error);
    }
  }, [favorites]);

  // 復習単語管理 (簡素化実装)
  const toggleReviewWord = useCallback(async (wordId: string) => {
    try {
      const isReview = reviewWords.has(wordId);
      
      // TODO: 実際のデータベース更新を実装
      if (isReview) {
        setReviewWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(wordId);
          return newSet;
        });
      } else {
        setReviewWords(prev => new Set(prev).add(wordId));
      }
    } catch (error) {
      console.error('復習単語の更新に失敗:', error);
    }
  }, [reviewWords]);

  // 日本語表示切り替え
  const toggleJapanese = useCallback(() => {
    setShowJapanese(prev => !prev);
  }, []);

  // 例文表示切り替え
  const handleExampleClick = useCallback((exampleKey: string) => {
    setFlippedExamples(prev => {
      const newSet = new Set(prev);
      const wasFlipped = newSet.has(exampleKey);

      if (wasFlipped) {
        newSet.delete(exampleKey);
      } else {
        newSet.add(exampleKey);
      }

      return newSet;
    });
  }, []);

  // 再学習リストに追加
  const addToRetry = useCallback(() => {
    if (!currentWord || isInRetryMode) return;

    setIncorrectWords(prev => [...prev, currentWord]);
    goToNext();
  }, [currentWord, isInRetryMode, goToNext]);

  // 単語音声再生 (簡素化実装)
  const playWordAudio = useCallback(async () => {
    if (!currentWord) return;

    try {
      // TODO: 実際の音声再生実装
      console.log('Playing audio for word:', currentWord.word);
    } catch (error) {
      console.error('音声再生に失敗:', error);
    }
  }, [currentWord]);

  // 例文音声再生
  const playExampleAudio = useCallback(async (
    text: string, 
    exampleIndex: 1 | 2 | 3, 
    lang: 'en' | 'ja'
  ) => {
    try {
      if (lang === 'ja') {
        // 日本語の場合は TTS を使用（実装は省略）
        devLog.info('Japanese TTS not implemented yet');
        return;
      }

      // 英語例文の音声ファイルを探す
      if (currentWord?.audio_file) {
        const path = `${currentWord.audio_file}/example${String(exampleIndex).padStart(3, '0')}.mp3`;
        devLog.log('Try example audio (by audio_file):', path);
        const blob = await fetchAudioFromStorage(path);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.volume = isMuted ? 0 : volume;
          await audio.play();
          return;
        }
      }

      // フォールバック: 英単語フォルダ直下を探す
      if (currentWord?.word) {
        const fallbackPath = buildPathFromWord(currentWord.word, exampleIndex);
        devLog.log('Try example audio (by word):', fallbackPath);
        const blob = await fetchAudioFromStorage(fallbackPath);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.volume = isMuted ? 0 : volume;
          await audio.play();
        }
      }
    } catch (error) {
      devLog.warn('例文音声の取得に失敗:', error);
    }
  }, [currentWord, volume, isMuted]);

  // セッション完了
  const completeSession = useCallback(() => {
    if (incorrectWords.length > 0 && !isInRetryMode) {
      // 間違えた問題で復習モード開始
      setCurrentWordList(incorrectWords);
      setCurrentIndex(0);
      setIsInRetryMode(true);
      setIncorrectWords([]);
    } else {
      // セッション完了
      onComplete?.({ incorrectWords });
    }
  }, [incorrectWords, isInRetryMode, onComplete]);

  return {
    // 状態
    currentIndex,
    favorites,
    reviewWords,
    flippedExamples,
    showJapanese,
    incorrectWords,
    isInRetryMode,
    currentWordList,
    
    // 計算値
    currentWord,
    total,
    progress,
    canGoBack,
    canGoNext,
    
    // アクション
    goToNext,
    goToPrevious,
    toggleFavorite,
    toggleReviewWord,
    toggleJapanese,
    handleExampleClick,
    addToRetry,
    playWordAudio,
    playExampleAudio,
    completeSession,
  };
}
