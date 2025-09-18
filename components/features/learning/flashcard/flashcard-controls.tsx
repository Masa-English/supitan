/**
 * フラッシュカードのコントロールコンポーネント
 * ナビゲーションボタンと操作ボタンを管理
 */

'use client';

import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashcardControlsProps {
  currentIndex: number;
  totalWords: number;
  showJapanese: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  isInRetryMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleJapanese: () => void;
  onAddToRetry?: () => void;
  onComplete?: () => void;
}

export function FlashcardControls({
  currentIndex,
  totalWords,
  showJapanese,
  canGoBack,
  canGoNext,
  isInRetryMode,
  onPrevious,
  onNext,
  onToggleJapanese,
  onAddToRetry,
  onComplete,
}: FlashcardControlsProps) {
  const isLastWord = currentIndex >= totalWords - 1;

  return (
    <div className="flex-shrink-0 p-4 bg-background border-t">
      <div className="space-y-4">
        {/* 進捗表示 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalWords} 
            {isInRetryMode && <span className="ml-2 text-orange-600">(復習モード)</span>}
          </p>
          
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
            />
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleJapanese}
            className="flex items-center gap-2"
          >
            {showJapanese ? (
              <>
                <EyeOff className="h-4 w-4" />
                日本語を隠す
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                日本語を表示
              </>
            )}
          </Button>

          {!isInRetryMode && onAddToRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToRetry}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <RefreshCw className="h-4 w-4" />
              もう一度学習
            </Button>
          )}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>

          {isLastWord ? (
            <Button
              onClick={onComplete}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="h-4 w-4" />
              完了
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 完了時のメッセージ */}
        {isLastWord && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              🎉 すべての単語を確認しました！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
