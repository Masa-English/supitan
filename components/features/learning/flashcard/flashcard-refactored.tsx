/**
 * リファクタリングされたフラッシュカードコンポーネント
 * 小さなコンポーネントに分割して保守性を向上
 */

'use client';

import { FlashcardWordDisplay } from './flashcard-word-display';
import { FlashcardExamples } from './flashcard-examples';
import { FlashcardControls } from './flashcard-controls';
import { useFlashcard } from './flashcard-hooks';
import type { Word } from '@/lib/types';

interface FlashcardRefactoredProps {
  words: Word[];
  onComplete?: (results: { incorrectWords: Word[] }) => void;
  onIndexChange?: (index: number) => void;
  key?: string | number; // リセット用のキーを追加
}

export function FlashcardRefactored({ 
  words, 
  onComplete, 
  onIndexChange 
}: FlashcardRefactoredProps) {
  console.log('Flashcard component loaded with words:', words.length);
  
  const {
    // 状態
    currentIndex,
    favorites,
    flippedExamples,
    showJapanese,
    incorrectWords: _incorrectWords,
    isInRetryMode,
    currentWordList,
    
    // 計算値
    currentWord,
    total,
    progress: _progress,
    canGoBack,
    canGoNext,
    
    // アクション
    goToNext,
    goToPrevious,
    toggleFavorite,
    toggleJapanese,
    handleExampleClick,
    addToRetry,
    playWordAudio,
    playExampleAudio,
    completeSession,
  } = useFlashcard(words, onComplete, onIndexChange);

  if (currentWordList.length === 0 || !currentWord) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          単語が0件です。前の画面に戻って条件を変更してください。
        </p>
      </div>
    );
  }

  const isFavorite = favorites.has(currentWord.id);

  return (
    <div className="h-screen flex flex-col safe-bottom" style={{ minHeight: '100dvh' }}>
      {/* メインコンテンツエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* 単語表示カード */}
          <FlashcardWordDisplay
            word={currentWord}
            showJapanese={showJapanese}
            isFavorite={isFavorite}
            onToggleFavorite={() => toggleFavorite(currentWord.id)}
            onPlayAudio={playWordAudio}
          />

          {/* 例文表示 */}
          <FlashcardExamples
            word={currentWord}
            flippedExamples={flippedExamples}
            onExampleClick={handleExampleClick}
            onPlayExampleAudio={playExampleAudio}
          />
        </div>
      </div>

      {/* コントロール部分 */}
      <FlashcardControls
        currentIndex={currentIndex}
        totalWords={total}
        showJapanese={showJapanese}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        isInRetryMode={isInRetryMode}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToggleJapanese={toggleJapanese}
        onAddToRetry={addToRetry}
        onComplete={completeSession}
      />
    </div>
  );
}
