'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Word, QuizQuestion } from '@/lib/types';
import { Quiz } from '@/components/features/learning/quiz';
import { CompletionModal } from '@/components/features/learning/completion-modal';
import { DatabaseService } from '@/lib/database';
import { useAuth } from '@/lib/hooks/use-auth';
// import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationStore, useLearningSessionStore } from '@/lib/stores';

interface Props {
  category: string;
  words: Word[];
  initialQuestions?: QuizQuestion[];
  allSections?: string[];
}

export default function QuizClient({ category, words, initialQuestions, allSections }: Props) {
  const { user, loading: authLoading, error: authError } = useAuth();
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const startNavigating = useNavigationStore((s) => s.start);
  
  // 学習セッションストア
  const {
    setLearningSession,
    getNextSection,
    category: _storeCategory,
    currentSection: storeCurrentSection,
    sections: _storeSections,
    learningMode: storeLearningMode,
    hasNextSection: storeHasNextSection
  } = useLearningSessionStore();

  // 現在のセクションを取得
  const { currentSection, sections } = useMemo(() => {
    if (words.length === 0) {
      return { currentSection: null, sections: [] };
    }

    // allSectionsが渡されている場合はそれを使用、そうでなければwordsから計算
    const sectionList = allSections || [...new Set(words.map(w => String(w.section || '')))].sort();
    const currentSection = words[0]?.section ? String(words[0].section) : null;

    console.log('セクション情報:', {
      sections: sectionList,
      currentSection,
      totalSections: sectionList.length,
      words: words.length,
      allSectionsProvided: !!allSections
    });

    return { currentSection, sections: sectionList };
  }, [words, allSections]);

  // 学習セッション情報をストアに保存
  useEffect(() => {
    if (currentSection && sections.length > 0) {
      const learningMode = sessionStorage.getItem('selectedLearningMode') as 'flashcard' | 'quiz' || 'quiz';
      
      setLearningSession({
        category,
        currentSection,
        sections: sections,
        learningMode,
      });
    }
  }, [category, currentSection, sections, setLearningSession]);

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

  const handleNextSection = () => {
    // ストアから次のセクション情報を取得
    const nextSectionFromStore = getNextSection();
    
    if (!nextSectionFromStore) {
      console.warn('次のセクションが見つかりません');
      return;
    }
    
    // 学習モードを取得（ストアまたはセッションストレージから）
    const learningMode = storeLearningMode || sessionStorage.getItem('selectedLearningMode') || 'quiz';
    const targetPath = `/dashboard/category/${encodeURIComponent(category)}/${learningMode}/section/${encodeURIComponent(nextSectionFromStore)}`;
    
    console.log('次のセクションに移動:', {
      from: storeCurrentSection,
      to: nextSectionFromStore,
      path: targetPath,
      learningMode
    });
    
    startNavigating();
    router.push(targetPath);
  };

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
          onClose={() => setShowCompletionModal(false)}
          category={category}
          results={sessionResults}
          totalQuestions={words.length}
          section={currentSection || ''}
          onRetry={() => setShowCompletionModal(false)}
          onGoHome={() => {
            if (pathname !== '/dashboard') {
              startNavigating();
              router.push('/dashboard');
            }
          }}
          onNextSection={handleNextSection}
          hasNextSection={storeHasNextSection}
        />
      )}
    </div>
  );
}


