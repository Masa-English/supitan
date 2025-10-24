import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services/data-provider';
import ReviewUrgentClient from '../review-urgent-client';

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

async function getUrgentReviewData(userId: string) {
  try {
    const [userProgress, allWords] = await Promise.all([
      dataProvider.getUserProgress(userId),
      dataProvider.getAllWords()
    ]);

    // 緊急復習が必要な単語を特定（予定より大幅に遅れている単語）
    const now = new Date();
    const urgentReviewWords = userProgress.filter(progress => {
      if (!progress.last_studied) return false;
      const lastReview = new Date(progress.last_studied);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      // 習得レベルに応じた復習間隔
      const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
      const reviewInterval = {
        1: 1, 2: 3, 3: 7, 4: 14, 5: 30
      }[masteryLevel] || 1;

      // 予定の2倍経過している場合を緊急復習とする
      return daysSinceReview >= reviewInterval * 2;
    });

    // 緊急復習単語の詳細情報を取得
    const urgentReviewWordsWithDetails = urgentReviewWords
      .map(progress => {
        const word = allWords.find(w => w.id === progress.word_id);
        if (word && progress.word_id) {
          return {
            word_id: progress.word_id,
            word: word,
            progress: progress,
            isFromReviewList: false
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      urgentReviewWords: urgentReviewWordsWithDetails,
      totalCount: urgentReviewWordsWithDetails.length
    };
  } catch (error) {
    console.error('緊急復習データ取得エラー:', error);
    return {
      urgentReviewWords: [],
      totalCount: 0
    };
  }
}

// 動的レンダリングを強制（認証が必要なため）
export const dynamic = 'force-dynamic';

export default async function ReviewUrgentPage() {
  const user = await getAuthenticatedUser();
  const reviewData = await getUrgentReviewData(user.id);

  // 緊急復習対象の単語がない場合は全体復習ページにリダイレクト
  if (reviewData.totalCount === 0) {
    redirect('/review');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            緊急復習
          </h1>
          <p className="text-muted-foreground">
            予定より大幅に遅れている単語を優先的に復習します
          </p>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              全 {reviewData.totalCount} 語の緊急復習対象単語があります
            </p>
          </div>
        </div>

        <ReviewUrgentClient urgentReviewWords={reviewData.urgentReviewWords} />
      </div>
    </div>
  );
}
