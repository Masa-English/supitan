'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Flashcard } from '@/components/learning/flashcard';
import { CompletionModal } from '@/components/learning/completion-modal';
// import { AudioPreloader } from '@/components/learning/audio-preloader';
import { useToast } from '@/components/ui/toast';


export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  // const [audioLoading, setAudioLoading] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [_currentIndex, setCurrentIndex] = useState(0);
  
  // モーダル状態管理
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // リセット用のキー
  const [resetKey, setResetKey] = useState(0);
  
  // データ取得状態を管理
  const [dataFetched, setDataFetched] = useState(false);
  
  // タブ復元検出用のref
  const isTabRestored = useRef(false);
  const hasInitialized = useRef(false);
  
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);
  const { showToast } = useToast();

  
  // プログレス計算（使用されていないため削除）
  // const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // タブ復元検出とセッションストレージ管理
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `flashcard_${category}_data`;
    
    // ページが非表示になった時の処理
    const handleVisibilityChange = () => {
      if (document.hidden && words.length > 0) {
        // ページが非表示になった時にデータを保存
        sessionStorage.setItem(storageKey, JSON.stringify({
          words,
          timestamp: Date.now()
        }));
      }
    };

    // ページが表示された時の処理
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // タブ復元を検出
        isTabRestored.current = true;
        console.log('タブ復元を検出しました');
      }
    };

    // イベントリスナーを追加
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [category, words]);

  const loadData = useCallback(async () => {
    // タブ復元の場合はセッションストレージから復元
    if (isTabRestored.current && typeof window !== 'undefined') {
      const storageKey = `flashcard_${category}_data`;
      const savedData = sessionStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const dataAge = Date.now() - parsedData.timestamp;
          
          // 5分以内のデータのみ復元
          if (dataAge < 5 * 60 * 1000) {
            setWords(parsedData.words);
            setDataFetched(true);
            setLoading(false);
            console.log('セッションストレージからデータを復元しました');
            return;
          }
        } catch (error) {
          console.error('セッションストレージの復元エラー:', error);
        }
      }
    }

    // 既にデータが取得済みの場合はスキップ
    if (dataFetched && words.length > 0) {
      setLoading(false);
      return;
    }

    try {
      const wordsData = await db.getWordsByCategory(category);
      setWords(wordsData);
      setDataFetched(true);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db, dataFetched, words.length]);

  useEffect(() => {
    if (user && !dataFetched && !hasInitialized.current) {
      hasInitialized.current = true;
      // loadDataを直接呼び出し
      const fetchData = async () => {
        try {
          const wordsData = await db.getWordsByCategory(category);
          setWords(wordsData);
          setDataFetched(true);
        } catch (error) {
          console.error('データの読み込みに失敗しました:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, dataFetched, category, db]);



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



  const handleRetry = () => {
    setShowCompletionModal(false);
    setSessionResults([]);
    setCurrentIndex(0);
    // データ取得状態もリセット
    setDataFetched(false);
    // タブ復元フラグもリセット
    isTabRestored.current = false;
    hasInitialized.current = false;
    // セッションストレージもクリア
    if (typeof window !== 'undefined') {
      const storageKey = `flashcard_${category}_data`;
      sessionStorage.removeItem(storageKey);
    }
    // リセットキーを更新してコンポーネントを完全にリセット
    setResetKey(prev => prev + 1);
    // 状態をリセットしてからデータを再読み込み
    setLoading(true);
    loadData();
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

  // 音声読み込みコールバックを最適化（現在は使用されていない）
  // const handleAudioLoadComplete = useCallback(() => {
  //   setAudioLoading(false);
  // }, []);

  // const handleAudioLoadProgress = useCallback((_loaded: number, _total: number) => {
  //   if (!audioLoading) {
  //     setAudioLoading(true);
  //   }
  // }, [audioLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-2 sm:px-3 lg:px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {category}の単語データを読み込み中...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-2 sm:px-3 lg:px-4">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
              <div className="text-amber-600 dark:text-amber-400 text-xl sm:text-2xl lg:text-3xl">📚</div>
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3">
              単語が見つかりません
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 lg:mb-6">
              {category}カテゴリーに単語が登録されていないか、データの読み込みに失敗しました。
            </p>
            <button
              onClick={handleBackToHome}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm"
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
      <main className="flex-1 flex flex-col justify-around sm:justify-around pb-safe">
        <Flashcard
          key={resetKey} // Flashcardコンポーネントをリセットするためにkeyを追加
          words={words}
          onComplete={handleComplete}
          category={category}
          onIndexChange={setCurrentIndex}
        />
      </main>

      {/* 音声ファイル事前読み込み - 一時的に無効化 */}
      {/* <AudioPreloader
        words={words}
        onLoadComplete={handleAudioLoadComplete}
        onLoadProgress={handleAudioLoadProgress}
      /> */}

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