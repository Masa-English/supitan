'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Word } from '@/lib/types';
import { Flashcard } from '@/components/features/learning/flashcard/flashcard';
import { CompletionModal } from '@/components/features/learning/shared/completion-modal';
import { Review } from '@/components/features/learning/review/review';
import { DatabaseService } from '@/lib/api/database/database';
import { ReloadButton } from '@/components/shared/reload-button';


import { useRouter, usePathname } from 'next/navigation';
import { useNavigationStore, useLearningSessionStore } from '@/lib/stores';

interface Props {
  category: string;
  words: Word[];
  allSections?: string[];
}

export default function FlashcardClient({ category, words, allSections }: Props) {
  console.log('FlashcardClient: レンダリング開始', { 
    category: category, 
    wordsCount: words.length, 
    allSections: allSections?.length 
  });
  
  // サーバーサイドで認証確認済みなので、クライアントサイドでは認証チェックをスキップ
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const db = new DatabaseService();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [showReviewMode, setShowReviewMode] = useState(false);
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

  // 初期化処理（認証はサーバーサイドで確認済み）
  useEffect(() => {
    console.log('FlashcardClient: 初期化useEffect開始');
    
    const initialize = async () => {
      console.log('FlashcardClient: 初期化処理開始');
      try {
        // 必要に応じてユーザー情報を取得（ただし、エラーでも継続）
        const { createClient } = await import('@/lib/api/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log('FlashcardClient: ユーザー情報取得成功', { hasUser: !!user });
        setUser(user);
      } catch (error) {
        console.warn('ユーザー情報取得に失敗しましたが、継続します:', error);
        // エラーでも継続（サーバーサイドで認証済みのため）
      } finally {
        console.log('FlashcardClient: 初期化完了');
        setIsInitialized(true);
      }
    };
    
    // 短い遅延後に初期化（即座に表示するため）
    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, []);

  // 学習セッション情報をストアに保存
  useEffect(() => {
    if (currentSection && sections.length > 0) {
      const learningMode = sessionStorage.getItem('selectedLearningMode') as 'flashcard' | 'quiz' || 'flashcard';
      
      setLearningSession({
        category: category,
        currentSection,
        sections: sections,
        learningMode,
      });
    }
  }, [category, currentSection, sections, setLearningSession]);

  const handleComplete = async (results: { wordId: string; correct: boolean }[]) => {
    setSessionResults(results);

    // ユーザー情報がある場合のみセッションを保存
    if (user?.id) {
      try {
        // 学習セッションを記録
        await db.createStudySession({
          user_id: user.id,
          category,
          mode: 'flashcard',
          total_words: results.length,
          completed_words: results.length,
          correct_answers: results.filter((r) => r.correct).length,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        });

        // 各単語の進捗を更新
        for (const result of results) {
          try {
            // 現在の進捗を取得
            const currentProgress = await db.getWordProgress(user.id, result.wordId);
            
            // 習熟度を計算（正解なら+0.1、不正解なら-0.2）
            const currentMasteryLevel = currentProgress?.mastery_level || 0;
            const newMasteryLevel = result.correct 
              ? Math.min(1.0, currentMasteryLevel + 0.1)
              : Math.max(0.0, currentMasteryLevel - 0.2);

            // 進捗を更新または作成
            await db.upsertProgress({
              user_id: user.id,
              word_id: result.wordId,
              mastery_level: newMasteryLevel,
              study_count: (currentProgress?.study_count || 0) + 1,
              correct_count: (currentProgress?.correct_count || 0) + (result.correct ? 1 : 0),
              incorrect_count: (currentProgress?.incorrect_count || 0) + (result.correct ? 0 : 1),
              last_studied: new Date().toISOString(),
              is_favorite: currentProgress?.is_favorite || false,
            });

            // 不正解の場合は復習リストに追加
            if (!result.correct) {
              try {
                await db.addToReview(user.id, result.wordId);
              } catch (reviewError) {
                console.warn('復習リスト追加エラー:', reviewError);
              }
            }
          } catch (progressError) {
            console.error('進捗更新エラー:', progressError);
          }
        }
      } catch (error) {
        console.warn('セッション保存に失敗しましたが、継続します:', error);
      }
    }

    // 不正解の単語がある場合、復習モードを表示
    const incorrectResults = results.filter(r => !r.correct);
    if (incorrectResults.length > 0) {
      setShowReviewMode(true);
      return;
    }

    setShowCompletionModal(true);
  };

  const handleReviewComplete = () => {
    setShowReviewMode(false);
    setShowCompletionModal(true);
  };

  const handleNextSection = () => {
    // ストアから次のセクション情報を取得
    const nextSectionFromStore = getNextSection();
    
    if (!nextSectionFromStore) {
      console.warn('次のセクションが見つかりません');
      return;
    }
    
    // 学習モードを取得（ストアまたはセッションストレージから）
    const learningMode = storeLearningMode || sessionStorage.getItem('selectedLearningMode') || 'flashcard';
    const targetPath = `/learning/${category}/${learningMode}/section/${encodeURIComponent(nextSectionFromStore)}`;
    
    console.log('次のセクションに移動:', {
      from: storeCurrentSection,
      to: nextSectionFromStore,
      path: targetPath,
      learningMode
    });
    
    startNavigating();
    router.push(targetPath);
  };

  // 初期化中の短時間のローディング表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 単語データがない場合のエラー表示
  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">単語データが見つかりません</p>
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            戻る
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

      {/* リロードボタン */}
      <div className="absolute top-4 right-4 z-10">
        <ReloadButton variant="outline" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          🔄 更新
        </ReloadButton>
      </div>

      <main className="flex-1 flex flex-col justify-around sm:justify-around pb-safe p-4">
        {showReviewMode ? (
          <Review onComplete={handleReviewComplete} />
        ) : (
          <Flashcard words={words} onComplete={handleComplete} category={category} />
        )}
      </main>
      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          category={category}
          section={currentSection || ''}
          results={sessionResults}
          totalQuestions={words.length}
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


