'use client';

import { useState } from 'react';
import { Review } from '@/components/review';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean; difficulty: number }[]>([]);
  const router = useRouter();

  const handleComplete = (reviewResults: { wordId: string; correct: boolean; difficulty: number }[]) => {
    setResults(reviewResults);
    setIsCompleted(true);
  };

  const handleBackToHome = () => {
    router.push('/protected');
  };

  const handleStartNewReview = () => {
    setIsCompleted(false);
    setResults([]);
  };

  if (isCompleted) {
    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const averageDifficulty = totalCount > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.difficulty, 0) / totalCount * 10) / 10 
      : 0;

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            復習完了！
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            お疲れさまでした。復習結果を確認してください。
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              復習結果
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  正答率
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalCount}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  復習単語数
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">正解数:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {correctCount} / {totalCount}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">平均難易度:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {averageDifficulty} / 5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ホームに戻る
          </Button>
          
          <Button
            onClick={handleStartNewReview}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
          >
            新しい復習を開始
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          復習モード
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          間隔反復アルゴリズムに基づいて、最適なタイミングで復習を行います。
        </p>
      </div>

      <Review onComplete={handleComplete} />
    </div>
  );
} 