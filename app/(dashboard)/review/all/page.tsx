import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services/data-provider';
import type { Word, UserProgress } from '@/lib/types/database';
import ReviewAllClient from '../review-all-client';

async function getAuthenticatedUser() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      redirect('/auth/login');
    }

    return user;
  } catch (error) {
    console.error('認証確認エラー:', error);
    redirect('/auth/login');
  }
}

async function getAllReviewData(userId: string) {
  try {
    const [userProgress, allWords, reviewWords] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords(),
      dataProvider.getReviewWords(userId) // 復習リストの単語を取得
    ]);

    // 復習間隔に基づく復習が必要な単語を特定
    const now = new Date();
    const intervalReviewWords = userProgress.filter(progress => {
      if (!progress.last_studied) return false;
      const lastReview = new Date(progress.last_studied);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      // 習得レベルに応じた復習間隔（mastery_levelは0-1の範囲）
      const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1; // 0-1を1-5に変換
      const reviewInterval = {
        1: 1,  // 1日
        2: 3,  // 3日
        3: 7,  // 1週間
        4: 14, // 2週間
        5: 30  // 1ヶ月
      }[masteryLevel] || 1;

      return daysSinceReview >= reviewInterval;
    });

    // 復習リストの単語と復習間隔の単語を結合（重複を除く）
    const reviewWordsSet = new Set<string>();
    const allReviewWords: Array<{
      word_id: string;
      word: Word;
      progress: UserProgress;
      isFromReviewList: boolean;
    }> = [];

    // 復習リストの単語を追加
    reviewWords.forEach(reviewWord => {
      const word = allWords.find(w => w.id === reviewWord.word_id);
      if (word && reviewWord.word_id) {
        reviewWordsSet.add(reviewWord.word_id);
        const progress = userProgress.find(p => p.word_id === reviewWord.word_id);
        allReviewWords.push({
          word_id: reviewWord.word_id,
          word: word,
          progress: progress || {
            id: '',
            user_id: null,
            word_id: reviewWord.word_id,
            mastery_level: 0,
            study_count: 0,
            correct_count: 0,
            incorrect_count: 0,
            last_studied: null,
            is_favorite: null,
            created_at: null,
            updated_at: null
          },
          isFromReviewList: true
        });
      }
    });

    // 復習間隔の単語を追加（重複を除く）
    intervalReviewWords.forEach(progress => {
      if (progress.word_id && !reviewWordsSet.has(progress.word_id)) {
        const word = allWords.find(w => w.id === progress.word_id);
        if (word) {
          allReviewWords.push({
            word_id: progress.word_id,
            word: word,
            progress: progress,
            isFromReviewList: false
          });
        }
      }
    });

    return {
      allReviewWords,
      totalCount: allReviewWords.length
    };
  } catch (error) {
    console.error('全復習データ取得エラー:', error);
    return {
      allReviewWords: [],
      totalCount: 0
    };
  }
}

// 動的レンダリングを強制（認証が必要なため）
export const dynamic = 'force-dynamic';

export default async function ReviewAllPage() {
  const user = await getAuthenticatedUser();
  const reviewData = await getAllReviewData(user.id);

  // 復習対象の単語がない場合は全体復習ページにリダイレクト
  if (reviewData.totalCount === 0) {
    redirect('/review');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            全カテゴリ復習
          </h1>
          <p className="text-muted-foreground">
            すべてのカテゴリの復習対象単語をまとめて学習します
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              復習対象の単語があります
            </p>
          </div>
        </div>

        <ReviewAllClient allReviewWords={reviewData.allReviewWords} />
      </div>
    </div>
  );
}
