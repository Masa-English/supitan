import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services/data-provider';
import ReviewListClient from '../review-list-client';

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

async function getReviewListData(userId: string) {
  try {
    const [allWords, reviewWords] = await Promise.all([
      dataProvider.getAllWords(),
      dataProvider.getReviewWords(userId)
    ]);

    // 復習リストの単語の詳細情報を取得
    const reviewListWordsWithDetails = reviewWords
      .map(reviewWord => {
        const word = allWords.find(w => w.id === reviewWord.word_id);
        if (word) {
          return {
            word_id: reviewWord.word_id,
            word: word,
            isFromReviewList: true
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      reviewListWords: reviewListWordsWithDetails,
      totalCount: reviewListWordsWithDetails.length
    };
  } catch (error) {
    console.error('復習リストデータ取得エラー:', error);
    return {
      reviewListWords: [],
      totalCount: 0
    };
  }
}

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

// 動的レンダリングを強制（認証が必要なため）
export const dynamic = 'force-dynamic';

export default async function ReviewListPage() {
  const user = await getAuthenticatedUser();
  const reviewData = await getReviewListData(user.id);

  // 復習リストの単語がない場合は全体復習ページにリダイレクト
  if (reviewData.totalCount === 0) {
    redirect('/review');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            復習リスト
          </h1>
          <p className="text-muted-foreground">
            間違えた単語を重点的に復習します
          </p>
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              全 {reviewData.totalCount} 語の復習リスト単語があります
            </p>
          </div>
        </div>

        <ReviewListClient reviewListWords={reviewData.reviewListWords} />
      </div>
    </div>
  );
}
