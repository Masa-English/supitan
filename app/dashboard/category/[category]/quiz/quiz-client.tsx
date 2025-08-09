'use client';

import { useState } from 'react';
import type { Word } from '@/lib/types';
import { Quiz } from '@/components/learning/quiz';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import { useAuth } from '@/lib/hooks/use-auth';

interface Props {
  category: string;
  words: Word[];
}

export default function QuizClient({ category, words }: Props) {
  const { user } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);

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
      <Quiz words={words} onComplete={handleComplete} onAddToReview={handleAddToReview} />
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
          onBackToHome={() => (window.location.href = '/dashboard')}
          onGoToReview={() => (window.location.href = '/dashboard/review')}
          onBackToCategory={() => (window.location.href = `/dashboard/category/${encodeURIComponent(category)}`)}
        />
      )}
    </div>
  );
}


