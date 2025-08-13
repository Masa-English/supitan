'use client';

import { useState } from 'react';
import { Flashcard } from '@/components/learning/flashcard';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import type { Word } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
// import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';
import { Loader2 } from 'lucide-react';

interface Props {
  category: string;
  words: Word[];
}

export default function FlashcardClient({ category, words }: Props) {
  const { user, loading: authLoading, error: authError } = useAuth();
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

  // 認証のローディング中はローディング画面を表示
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground font-medium">認証中...</p>
        </div>
      </div>
    );
  }

  // 認証エラーがある場合はエラーメッセージを表示
  if (authError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">認証エラーが発生しました</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 音声の事前読み込みを一時的に無効化（無限ローディング防止） */}
      {/* {words.some(word => word.audio_file) && (
        <AudioPreloader words={words} />
      )} */}
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


