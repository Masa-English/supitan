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
    if (results.accuracy >= 90) return { message: "素晴らしい！", color: "text-green-600", bgColor: "from-green-500 to-emerald-600" };
    if (results.accuracy >= 70) return { message: "よくできました！", color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" };
    if (results.accuracy >= 50) return { message: "がんばりました！", color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" };
    return { message: "次回もがんばりましょう！", color: "text-orange-600", bgColor: "from-orange-500 to-red-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title=""
      className="max-w-2xl mx-4"
    >
      <ModalBody className="p-6">
        <div className="text-center mb-6 sm:mb-8">
          {/* モダンなアイコンデザイン */}
          <div className="relative mb-6 sm:mb-8">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br ${performance.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* 装飾的な背景要素 */}
            <div className={`absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br ${performance.bgColor.replace('500', '400').replace('600', '500')}/20 rounded-full blur-xl`}></div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-200 mb-2 sm:mb-3">
            学習完了！
          </h3>
          <p className={`text-lg sm:text-xl font-semibold mb-2 ${performance.color}`}>
            {performance.message}
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-base sm:text-lg">
            {category}の学習が完了しました
          </p>
        </div>

        {/* 結果表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {results.correctCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              正解数
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {results.totalWords}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              総問題数
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {results.accuracy}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              正答率
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">学習進捗</span>
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{results.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${results.accuracy}%` }}
            />
          </div>
        </div>

        {/* 次のアクションの説明 */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-amber-700 dark:text-amber-300 text-base sm:text-lg">
            次は何をしますか？
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="flex-col gap-3 sm:gap-4 p-6">
        {/* メインアクション */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button
            onClick={onGoToReview}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 sm:py-3 h-16 sm:h-12 text-base sm:text-sm font-medium touch-target"
          >
            <BookOpen className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            復習する
          </Button>
          <Button
            onClick={onBackToHome}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-4 sm:py-3 h-16 sm:h-12 text-base sm:text-sm font-medium touch-target"
          >
            <Home className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {/* サブアクション */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20 py-4 sm:py-3 h-16 sm:h-12 text-base sm:text-sm font-medium touch-target"
          >
            <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            最初からやり直す
          </Button>
          <Button
            variant="outline"
            onClick={onBackToCategory}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 py-4 sm:py-3 h-16 sm:h-12 text-base sm:text-sm font-medium touch-target"
          >
            カテゴリーに戻る
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
} 