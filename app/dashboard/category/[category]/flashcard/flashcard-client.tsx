'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/components/learning/flashcard';
import { CompletionModal } from '@/components/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import type { Word } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';
import { Loader2 } from 'lucide-react';

interface Props {
  category: string;
  words: Word[];
}

export default function FlashcardClient({ category, words }: Props) {
  const { user } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);

  // コンポーネントの初期化時にローディング状態を管理
  useEffect(() => {
    if (words && words.length > 0) {
      // 少し遅延させてからローディングを解除（音声の事前読み込み時間を考慮）
      const timer = setTimeout(() => {
        setIsLoading(false);
        // ナビゲーション状態を停止
        startNavigating();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [words, startNavigating]);

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
      {/* ローディング状態の表示 */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground font-medium">学習データを読み込み中...</p>
            <p className="text-sm text-muted-foreground mt-2">
              {words.length}個の単語を準備しています
            </p>
          </div>
        </div>
      )}

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


