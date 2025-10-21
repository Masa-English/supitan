'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Word, ReviewWordWithWord } from '@/lib/types';
import { Review } from '@/components/features/learning/review/review';
import { CompletionModal } from '@/components/features/learning/shared';

interface Props {
  reviewListWords: Array<{
    word_id: string;
    word: Word;
    isFromReviewList: boolean;
  }>;
}

export default function ReviewListClient({ reviewListWords }: Props) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();

  // 復習リスト単語をReviewWordWithWord形式に変換
  const reviewWords: ReviewWordWithWord[] = useMemo(() => {
    return reviewListWords.map(item => ({
      id: `${item.word_id}-review-list`,
      user_id: '',
      word_id: item.word_id,
      created_at: new Date().toISOString(),
      word: item.word
    }));
  }, [reviewListWords]);

  const handleReviewComplete = (results: { wordId: string; correct: boolean }[]) => {
    setSessionResults(results);
    setShowCompletionModal(true);
  };

  const handleExitReview = () => {
    router.push('/review');
  };

  const totalQuestions = reviewWords.length;

  return (
    <div className="min-h-screen bg-background">
      <Review
        onComplete={handleReviewComplete}
        onExit={handleExitReview}
        mode="review-list"
        reviewWords={reviewWords}
      />

      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          category="復習リスト"
          results={sessionResults}
          totalQuestions={totalQuestions}
          section=""
          onRetry={() => setShowCompletionModal(false)}
          onGoHome={() => router.push('/dashboard')}
          onNextSection={() => router.push('/review')}
          hasNextSection={true}
        />
      )}
    </div>
  );
}
