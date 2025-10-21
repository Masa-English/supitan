'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, RotateCcw, Home, BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onGoHome: () => void;
  onNextSection?: () => void;
  hasNextSection?: boolean;
  results: { wordId: string; correct: boolean; totalWords?: number }[];
  totalQuestions: number;
  category: string;
  section: string;
}

export function CompletionModal({
  isOpen,
  onClose: _onClose,
  onRetry,
  onGoHome,
  onNextSection,
  category,
  section: _section,
  results,
  totalQuestions,
  hasNextSection,
}: CompletionModalProps) {
  if (!isOpen) return null;

  const correctAnswers = results.filter(r => r.correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardContent className="p-4 sm:p-6 text-center">
          {/* 成功インジケーター */}
          <div className="mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">学習完了！</h3>
          <p className="text-base sm:text-lg font-semibold text-green-600 mb-1">素晴らしい！</p>
          <p className="text-sm sm:text-base text-amber-700 dark:text-amber-300 mb-4 sm:mb-6">
            {decodeURIComponent(category)}の学習が完了しました
            </p>

          {/* 統計情報 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{correctAnswers}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">正解数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{totalQuestions}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">総問題数</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{accuracy.toFixed(0)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">正答率</div>
            </div>
          </div>

          {/* 学習進捗 */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">学習進捗</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{accuracy.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          {/* 次のアクション */}
          <p className="text-sm sm:text-base text-amber-700 dark:text-amber-300 mb-3 sm:mb-4">次は何をしますか？</p>

          {/* アクションボタン - 2列グリッドレイアウト */}
          <div className="space-y-3">
            {/* 1行目: 復習と次のセクション/ホーム */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={onRetry}
                className="h-12 sm:h-14 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">復習する</span>
                <span className="sm:hidden">復習</span>
              </Button>

              {hasNextSection && onNextSection ? (
                <Button
                  onClick={onNextSection}
                  className="h-12 sm:h-14 text-sm sm:text-base font-medium bg-green-600 hover:bg-green-700 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">次のセクションへ</span>
                  <span className="sm:hidden">次へ</span>
                </Button>
              ) : (
                <Button
                  onClick={onGoHome}
                  className="h-12 sm:h-14 text-sm sm:text-base font-medium bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Home className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">ホーム</span>
                  <span className="sm:hidden">ホーム</span>
                </Button>
              )}
            </div>

            {/* 2行目: やり直しとカテゴリー */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={onRetry}
                className="h-12 sm:h-14 text-sm sm:text-base font-medium border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
              >
                <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">やり直す</span>
                <span className="sm:hidden">やり直し</span>
              </Button>

              <Button
                variant="outline"
                onClick={onGoHome}
                className="h-12 sm:h-14 text-sm sm:text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="hidden sm:inline">カテゴリーに戻る</span>
                <span className="sm:hidden">カテゴリー</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}