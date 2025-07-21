'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Flashcard } from '@/components/flashcard';

import { Header } from '@/components/header';
import { CompletionModal } from '@/components/completion-modal';
import { useToast } from '@/components/ui/toast';

export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  
  // モーダル状態管理
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const wordsData = await db.getWordsByCategory(category);
      setWords(wordsData);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      await loadData();
    };

    getUser();
  }, [loadData, router, supabase.auth]);

  const handleComplete = async () => {
    if (!user) return;

    // フラッシュカード完了時は全て正解として扱う
    const results = words.map(word => ({ wordId: word.id, correct: true }));
    setSessionResults(results);
    setShowCompletionModal(true);

    // 結果をデータベースに保存
    try {
      await db.createStudySession({
        user_id: user.id,
        category,
        mode: 'flashcard',
        total_words: words.length,
        completed_words: words.length,
        correct_answers: words.length, // フラッシュカードは全て正解扱い
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });
    } catch (error) {
      console.error('学習セッションの保存に失敗しました:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    
    showToast(`「${word.word}」を復習リストに追加しました`, {
      type: 'success',
      title: '復習リストに追加',
      duration: 3000
    });
  };

  const handleRetry = () => {
    // ページをリロードして完全にリセット
    window.location.reload();
  };

  const handleBackToCategory = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}`);
  };

  const handleBackToHome = () => {
    router.push('/protected');
  };

  const handleGoToReview = () => {
    router.push('/protected/review');
  };

  const closeAllModals = () => {
    setShowCompletionModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700 dark:text-amber-300">読み込み中...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex flex-col">
      <Header 
        title={`${category} - フラッシュカード`}
        showBackButton={true}
        onBackClick={handleBackToCategory}
        showUserInfo={false}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0">
        <Flashcard
          words={words}
          onComplete={handleComplete}
          onAddToReview={handleAddToReview}
          category={category}
        />
      </main>

      {/* モーダル */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={closeAllModals}
        category={category}
        results={{
          totalWords: words.length,
          correctCount: sessionResults.filter(r => r.correct).length,
          accuracy: Math.round((sessionResults.filter(r => r.correct).length / Math.max(sessionResults.length, 1)) * 100)
        }}
        onGoToReview={handleGoToReview}
        onBackToHome={handleBackToHome}
        onRetry={handleRetry}
        onBackToCategory={handleBackToCategory}
      />


    </div>
  );
} 