'use client';

import { useState } from 'react';
import { Flashcard } from '@/components/learning/flashcard';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import type { Word } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';

interface Props {
  category: string;
  words: Word[];
}

export default function FlashcardClient({ category, words }: Props) {
  const { user } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);

  const handleComplete = async () => {
    if (!user) return;
    const results = words.map((w) => ({ wordId: w.id, correct: true }));
    setSessionResults(results);
    setShowCompletionModal(true);
    try {
      await db.createStudySession({
        user_id: user.id,
        category,
        mode: 'flashcard',
        total_words: words.length,
        completed_words: words.length,
        correct_answers: words.length,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      });
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 音声の事前読み込み中はオーバーレイを出す */}
      <AudioPreloader words={words} />
      <main className="flex-1 flex flex-col justify-around sm:justify-around pb-safe">
        <Flashcard words={words} onComplete={handleComplete} category={category} />
      </main>
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          category={category}
          results={{
            totalWords: words.length,
            correctCount: sessionResults.filter((r) => r.correct).length,
            accuracy: Math.round(
              (sessionResults.filter((r) => r.correct).length / Math.max(sessionResults.length, 1)) * 100
            ),
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


