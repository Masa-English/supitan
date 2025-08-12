'use client';

import { useState } from 'react';
import type { Word, QuizQuestion } from '@/lib/types';
import { Quiz } from '@/components/learning/quiz';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import { useAuth } from '@/lib/hooks/use-auth';
import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';

interface Props {
  category: string;
  words: Word[];
  initialQuestions?: QuizQuestion[];
}

export default function QuizClient({ category, words, initialQuestions }: Props) {
  const { user } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);

  const handleComplete = async (results: { wordId: string; correct: boolean }[]) => {
    if (!user) return;
    setSessionResults(results);
    setShowCompletionModal(true);
    try {
      await db.createStudySession({
        user_id: user.id,
        category,
        mode: 'quiz',
        total_words: results.length,
        completed_words: results.length,
        correct_answers: results.filter((r) => r.correct).length,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      });
    } catch {}
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;
    try {
      await db.addToReview(user.id, wordId);
    } catch {}
  };

  const closeAllModals = () => setShowCompletionModal(false);

  return (
    <div className="min-h-screen bg-background">
      {/* 音声ファイルの事前読み込み */}
      <AudioPreloader words={words} />
      <Quiz words={words} onComplete={handleComplete} onAddToReview={handleAddToReview} initialQuestions={initialQuestions} />
      {/* 学習完了後のボタン操作で画面遷移するため、視覚的に遷移中を示すオーバーレイはグローバルで表示される */}
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={closeAllModals}
          category={category}
          results={{
            totalWords: words.length,
            correctCount: sessionResults.filter((r) => r.correct).length,
            accuracy: Math.round((sessionResults.filter((r) => r.correct).length / Math.max(sessionResults.length, 1)) * 100),
          }}
          onRetry={() => setShowCompletionModal(false)}
          onBackToHome={() => { startNavigating(); router.push('/dashboard'); }}
          onGoToReview={() => { startNavigating(); router.push('/dashboard/review'); }}
          onBackToCategory={() => { startNavigating(); router.push(`/dashboard/category/${encodeURIComponent(category)}`); }}
        />
      )}
    </div>
  );
}


