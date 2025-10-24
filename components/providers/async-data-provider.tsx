import { Suspense } from 'react';
import { getStaticData, getStaticDataForCategory, StaticData } from '@/lib/constants/static-data';
import { StatsCardSkeleton, CategoryCardSkeleton, WordCardSkeleton } from '@/components/ui/feedback/skeleton';
import { Word } from '@/lib/types';

// カテゴリー一覧用の非同期コンポーネント
async function AsyncCategoriesList() {
  const data: StaticData = await getStaticData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.categories.map((category) => (
        <div key={category.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                {category.name}
              </span>
            </div>
            <p className="text-amber-700 dark:text-amber-300">
              {category.count}個の単語
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 単語一覧用の非同期コンポーネント
async function AsyncWordsList({ category }: { category: string }) {
  const words: Word[] = await getStaticDataForCategory(category);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {words.slice(0, 8).map((word) => (
        <div key={word.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">
              {word.word}
            </h3>
            <span className="text-xs border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 px-2 py-1 rounded-full border">
              {word.phonetic}
            </span>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              {word.japanese}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 統計ダッシュボード用の非同期コンポーネント
async function AsyncStatisticsDashboard() {
  const { DatabaseService } = await import('@/lib/api/database');
  const { createClient } = await import('@/lib/api/supabase/client');
  
  const supabase = createClient();
  
  // セッションが存在するかチェック（エラーハンドリング付き）
  let user = null;
  try {
    const { data: { user: userData }, error } = await supabase.auth.getUser();
    if (error) {
      const message = String((error as { message?: string }).message || '');
      const code = String((error as { code?: string }).code || '');
      const isExpected =
        message.includes('Refresh Token Not Found') ||
        message.includes('Invalid Refresh Token') ||
        message.includes('Auth session missing') ||
        code === 'refresh_token_not_found';
      if (!isExpected && process.env.NODE_ENV === 'development') {
        console.error('セッション確認エラー:', error);
      }
    } else if (userData) {
      user = userData;
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Session check skipped for statistics dashboard', e);
    }
  }
  
  if (!user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const db = new DatabaseService();
  const stats = await db.getAppStats(user.id);
  
  return (
    <div className="space-y-6">
      {/* メイン統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* 統計カードの内容 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-600 rounded-full"></div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                総単語数
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {stats.total_words}
            </div>
          </div>
        </div>
        {/* 他の統計カードも同様に実装 */}
      </div>
    </div>
  );
}

// エクスポート用のSuspense対応コンポーネント
export function SuspenseStatisticsDashboard() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    }>
      <AsyncStatisticsDashboard />
    </Suspense>
  );
}

export function SuspenseCategoriesList() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    }>
      <AsyncCategoriesList />
    </Suspense>
  );
}

export function SuspenseWordsList({ category }: { category: string }) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <WordCardSkeleton key={i} />
        ))}
      </div>
    }>
      <AsyncWordsList category={category} />
    </Suspense>
  );
}