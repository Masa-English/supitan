'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import dynamic from 'next/dynamic';
import { CompletionModal } from '@/components/learning';
import { useToast } from '@/components/ui/toast';

// 動的インポートでバンドルサイズを最適化
const Flashcard = dynamic(() => import('@/components/learning').then(mod => ({ default: mod.Flashcard })), {
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-amber-600"></div>
    </div>
  ),
  ssr: false
});

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
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    console.log('User authenticated:', {
      userId: user.id,
      email: user.email
    });

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

      // 各単語のプログレスを更新（フラッシュカードは学習したとして記録）
      for (const word of words) {
        try {
          // 既存の進捗を取得（お気に入り状態の保持のため）
          const existingProgress = await db.getWordProgress(user.id, word.id);
          
          // 新しい進捗値を計算
          const studyCount = (existingProgress?.study_count || 0) + 1;
          const correctCount = (existingProgress?.correct_count || 0) + 1;
          const incorrectCount = existingProgress?.incorrect_count || 0;
          
          // マスタリーレベルの計算（学習回数に基づいて徐々に上昇）
          const masteryLevel = Math.min(1, studyCount * 0.15);
          
          // 進捗を更新
          await db.upsertProgress({
            user_id: user.id,
            word_id: word.id,
            mastery_level: masteryLevel,
            study_count: studyCount,
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            is_favorite: existingProgress?.is_favorite || false,
            last_studied: new Date().toISOString()
          });
        } catch (error) {
          console.error(`単語 ${word.word} の進捗更新エラー:`, error);
        }
      }

      showToast(`学習完了！${words.length}個の単語を学習しました。`);
    } catch (error) {
      console.error('学習セッションの保存エラー:', error);
      showToast('学習結果の保存に失敗しました。');
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // 復習リストに追加
      await db.addToReview(user.id, wordId);
      
      showToast('この単語が復習リストに追加されました。');
    } catch (error) {
      console.error('復習リストへの追加エラー:', error);
      showToast('復習リストへの追加に失敗しました。');
    }
  };

  const handleRetry = () => {
    setShowCompletionModal(false);
    setSessionResults([]);
    // ページをリロードして完全にリセット
    window.location.reload();
  };

  const handleBackToHome = () => {
    router.push('/dashboard');
  };

  const handleGoToReview = () => {
    router.push('/dashboard/review');
  };

  const closeAllModals = () => {
    setShowCompletionModal(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {category}の単語データを読み込み中...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <div className="text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">📚</div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              単語が見つかりません
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {category}カテゴリーに単語が登録されていないか、データの読み込みに失敗しました。
            </p>
            <button
              onClick={handleBackToHome}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Flashcard
          words={words}
          onComplete={handleComplete}
          onAddToReview={handleAddToReview}
          category={category}
        />
      </main>

      {/* 完了モーダル */}
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={closeAllModals}
          category={category}
          results={{
            totalWords: words.length,
            correctCount: sessionResults.filter(r => r.correct).length,
            accuracy: Math.round((sessionResults.filter(r => r.correct).length / Math.max(sessionResults.length, 1)) * 100)
          }}
          onRetry={handleRetry}
          onBackToHome={handleBackToHome}
          onGoToReview={handleGoToReview}
          onBackToCategory={handleBackToHome}
        />
      )}
    </div>
  );
} 