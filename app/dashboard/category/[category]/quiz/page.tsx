'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Quiz } from '@/components/learning/quiz';
import { CompletionModal } from '@/components/learning/completion-modal';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  
  // モーダル状態管理
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);

  const loadData = useCallback(async (userId: string) => {
    try {
      const [wordsData, progressData] = await Promise.all([
        db.getWordsByCategory(category),
        db.getUserProgress(userId)
      ]);

      setWords(wordsData);
      
      // プログレスデータをマップ形式に変換
      const progressMap: Record<string, { mastery_level: number; is_favorite: boolean }> = {};
      progressData.forEach(progress => {
        if (progress.word_id) {
          progressMap[progress.word_id] = {
            mastery_level: progress.mastery_level || 0,
            is_favorite: progress.is_favorite || false
          };
        }
      });

    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db]);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    }
  }, [loadData, user]);

  const handleComplete = async (results: { wordId: string; correct: boolean }[]) => {
    if (!user) return;

    setSessionResults(results);
    setShowCompletionModal(true);

    // 結果をデータベースに保存
    try {
      await db.createStudySession({
        user_id: user.id,
        category,
        mode: 'quiz',
        total_words: results.length,
        completed_words: results.length,
        correct_answers: results.filter(r => r.correct).length,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });

      // 各単語のプログレスを更新
      for (const result of results) {
        try {
          const existingProgress = await db.getWordProgress(user.id, result.wordId);
          
          const studyCount = (existingProgress?.study_count || 0) + 1;
          const correctCount = (existingProgress?.correct_count || 0) + (result.correct ? 1 : 0);
          const incorrectCount = (existingProgress?.incorrect_count || 0) + (result.correct ? 0 : 1);
          
          // マスタリーレベルの計算
          const masteryLevel = Math.min(1, (correctCount / Math.max(studyCount, 1)) * 0.8 + (studyCount * 0.1));

          await db.upsertProgress({
            user_id: user.id,
            word_id: result.wordId,
            mastery_level: masteryLevel,
            study_count: studyCount,
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            is_favorite: existingProgress?.is_favorite || false,
            last_studied: new Date().toISOString()
          });

          // 間違えた問題は復習リストに追加
          if (!result.correct) {
            await db.addToReview(user.id, result.wordId);
          }
        } catch (error) {
          console.error(`単語 ${result.wordId} の進捗更新エラー:`, error);
        }
      }
    } catch (error) {
      console.error('学習セッションの保存エラー:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;

    try {
      await db.addToReview(user.id, wordId);
    } catch (error) {
      console.error('復習リストへの追加エラー:', error);
    }
  };

  const handleRetry = () => {
    setShowCompletionModal(false);
    setSessionResults([]);
    window.location.reload();
  };

  const handleBackToHome = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xs sm:text-base text-muted-foreground">
            {category}のクイズデータを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-3 sm:px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
            <div className="text-primary text-xl sm:text-2xl lg:text-3xl">🧠</div>
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3">
            単語が見つかりません
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground mb-3 sm:mb-4 lg:mb-6">
            {category}カテゴリーに単語が登録されていないか、データの読み込みに失敗しました。
          </p>
          <button
            onClick={handleBackToHome}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-base"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const handleGoToReview = () => {
    router.push('/dashboard/review');
  };

  const handleBackToCategory = () => {
    router.push(`/dashboard/category/${encodeURIComponent(category)}`);
  };

  const closeAllModals = () => {
    setShowCompletionModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Quiz
        words={words}
        onComplete={handleComplete}
        onAddToReview={handleAddToReview}
      />

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
          onBackToCategory={handleBackToCategory}
        />
      )}
    </div>
  );
} 