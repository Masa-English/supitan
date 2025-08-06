"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, RotateCcw, Check } from "lucide-react";

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
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-sm mx-4"
    >
      <div className="p-6 text-center">
        {/* 完了アイコン */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* 完了メッセージ */}
        <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
          学習完了！
        </h3>
        <p className="text-lg font-semibold text-green-600 mb-1">
          素晴らしい！
        </p>
        <p className="text-amber-700 dark:text-amber-300 mb-6">
          {category}の学習が完了しました
        </p>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {results.correctCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              正解数
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {results.totalWords}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              総問題数
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-orange-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {results.accuracy}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              正答率
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">学習進捗</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{results.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${results.accuracy}%` }}
            />
          </div>
        </div>

        {/* 次のアクション */}
        <p className="text-amber-700 dark:text-amber-300 mb-4">
          次は何をしますか？
        </p>

        {/* アクションボタン */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onGoToReview}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            復習する
          </Button>
          <Button
            onClick={onBackToHome}
            className="bg-orange-600 hover:bg-orange-700 text-white h-12"
          >
            <Home className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          <Button
            variant="outline"
            onClick={onRetry}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20 h-12"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            最初からやり直す
          </Button>
          <Button
            variant="outline"
            onClick={onBackToCategory}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 h-12"
          >
            カテゴリーに戻る
          </Button>
        </div>
      </div>
    </Modal>
  );
} 