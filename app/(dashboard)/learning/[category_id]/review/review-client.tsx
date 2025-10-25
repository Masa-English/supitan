'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Word, ReviewWordWithWord } from '@/lib/types';
import { Review } from '@/components/features/learning/review/review';
import { CompletionModal } from '@/components/features/learning/shared';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  category: string;
  words: Word[];
  mode: 'review-list' | 'interval' | 'urgent';
  level?: number;
}

export default function ReviewClient({ category, words, mode, level }: Props) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();

  // サーバー側で取得したwordsをReviewWordWithWord形式に変換
  const reviewWords: ReviewWordWithWord[] = useMemo(() => {
    return words.map(word => ({
      id: `${word.id}-${mode}`,
      user_id: '', // サーバー側で設定済みなのでクライアントでは使用しない
      word_id: word.id,
      created_at: new Date().toISOString(),
      word: word
    }));
  }, [words, mode]);

  const handleReviewComplete = (results: { wordId: string; correct: boolean }[]) => {
    setSessionResults(results);
    setShowCompletionModal(true);
  };

  const handleExitReview = () => {
    router.push('/review');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* レベル別フィルタリングのナビゲーション */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((levelNum) => (
                <Link
                  key={levelNum}
                  href={`/learning/${category}/review?mode=${mode}&level=${levelNum}`}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    level === levelNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  レベル {levelNum}
                </Link>
              ))}
              <Link
                href={`/learning/${category}/review?mode=${mode}`}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  level === undefined
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                すべて
              </Link>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExitReview}
              className="text-sm ml-4"
            >
              復習終了
            </Button>
          </div>
        </div>
      </div>

      <Review
        onComplete={handleReviewComplete}
        onExit={handleExitReview}
        mode={mode}
        category={category}
        level={level}
        reviewWords={reviewWords}
      />

      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          category={category}
          results={sessionResults}
          totalQuestions={words.length}
          section=""
          onRetry={() => setShowCompletionModal(false)}
          onGoHome={() => router.push('/dashboard')}
          onNextSection={() => router.push(`/learning/${category}/options`)}
          hasNextSection={false}
        />
      )}
    </div>
  );
}
