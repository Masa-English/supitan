'use client';

import { useState } from 'react';
import type { Word, QuizQuestion } from '@/lib/types';
import { Quiz } from '@/components/learning/quiz';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import { useAuth } from '@/lib/hooks/use-auth';
// import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';

interface Props {
  category: string;
  words: Word[];
  initialQuestions?: QuizQuestion[];
}

export default function QuizClient({ category, words, initialQuestions }: Props) {
  const { user, loading: authLoading, error: authError } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();
  const pathname = usePathname();
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

  // 認証のローディング中はローディング画面を表示
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">認証中...</p>
        </div>
      </div>
    );
  }

  // 認証エラーがある場合はエラーメッセージを表示
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* 音声ファイルの事前読み込みを一時的に無効化（無限ローディング防止） */}
      {/* <AudioPreloader words={words} /> */}
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
          onBackToHome={() => {
            if (pathname !== '/dashboard') {
              startNavigating();
              router.push('/dashboard');
            }
          }}
          onGoToReview={() => {
            if (pathname !== '/dashboard/review') {
              startNavigating();
              router.push('/dashboard/review');
            }
          }}
          onBackToCategory={() => {
            const targetPath = `/dashboard/category/${encodeURIComponent(category)}`;
            if (pathname !== targetPath) {
              startNavigating();
              router.push(targetPath);
            }
          }}
        />
      )}
    </div>
  );
}


