"use client";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Trophy, Target, Star } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  results: {
    totalWords: number;
    correctCount: number;
    accuracy: number;
  };
  onGoToReview: () => void;
  onBackToHome: () => void;
  onRetry: () => void;
  onBackToCategory: () => void;
}

export function CompletionModal({
  isOpen,
  onClose,
  category,
  results,
  onGoToReview,
  onBackToHome,
  onRetry,
  onBackToCategory
}: CompletionModalProps) {
  const getPerformanceMessage = () => {
    if (results.accuracy >= 90) return { emoji: "🎉", message: "素晴らしい！", color: "text-green-600" };
    if (results.accuracy >= 70) return { emoji: "👏", message: "よくできました！", color: "text-blue-600" };
    if (results.accuracy >= 50) return { emoji: "👍", message: "がんばりました！", color: "text-amber-600" };
    return { emoji: "💪", message: "次回もがんばりましょう！", color: "text-orange-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title=""
      className="max-w-2xl"
    >
      <ModalBody>
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">{performance.emoji}</div>
          <h3 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-3">
            学習完了！
          </h3>
          <p className={`text-xl font-semibold mb-2 ${performance.color}`}>
            {performance.message}
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-lg">
            {category}の学習が完了しました
          </p>
        </div>

        {/* 結果表示 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700 text-center">
            <Trophy className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {results.correctCount}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              正解数
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700 text-center">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {results.totalWords}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              総問題数
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-700 text-center">
            <Star className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {results.accuracy}%
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              正答率
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">学習進捗</span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{results.accuracy}%</span>
          </div>
          <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${results.accuracy}%` }}
            />
          </div>
        </div>

        {/* 次のアクションの説明 */}
        <div className="text-center mb-6">
          <p className="text-amber-700 dark:text-amber-300 text-lg">
            次は何をしますか？
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="flex-col gap-4">
        {/* メインアクション */}
        <div className="flex gap-4 w-full">
          <Button
            onClick={onGoToReview}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            復習する
          </Button>
          <Button
            onClick={onBackToHome}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3"
          >
            <Home className="h-5 w-5 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {/* サブアクション */}
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20 py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            もう一度挑戦
          </Button>
          <Button
            variant="outline"
            onClick={onBackToCategory}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 py-3"
          >
            カテゴリーに戻る
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
} 