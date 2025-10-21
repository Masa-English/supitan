import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Search,
  BookOpen,
  Clock,
  Target,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import serverLog, { LogCategory } from '@/lib/utils/server-logger';
import { DatabaseService } from '@/lib/api/database';

// 動的レンダリングを強制（認証が必要なため）
export const dynamic = 'force-dynamic';

// サーバーサイドでの認証確認
async function getAuthenticatedUser() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      serverLog.error('認証エラー', LogCategory.AUTH, { error: error.message });
      redirect('/login');
      return null; // This line won't be reached, but satisfies TypeScript
    }
    
    if (!user) {
      redirect('/login');
      return null; // This line won't be reached, but satisfies TypeScript
    }
    
    return user;
  } catch (error) {
    serverLog.error('認証確認エラー', LogCategory.AUTH, { error: error instanceof Error ? error.message : String(error) });
    redirect('/login');
    return null; // This line won't be reached, but satisfies TypeScript
  }
}

// ユーザー統計取得
async function getUserStats(userId: string) {
  try {
    const db = new DatabaseService();
    return await db.getAppStats(userId);
  } catch (error) {
    serverLog.error('統計取得エラー', LogCategory.DATABASE, { 
      error: error instanceof Error ? error.message : String(error),
      userId 
    });
    return null;
  }
}

// メインアクションカード
function MainActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color, 
  bgColor, 
  stats 
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  stats?: string;
}) {
  return (
    <Link href={href} prefetch className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            {stats && (
              <span className="text-sm font-medium text-muted-foreground">
                {stats}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      redirect('/login');
      return null;
    }
    const stats = await getUserStats(user.id);

    return (
      <div className="space-y-6 p-4">
        {/* ようこそメッセージ */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            ようこそ、{user?.email?.split('@')[0] || 'ユーザー'}さん
          </h1>
          <p className="text-muted-foreground">
            スピ単で効率的に英語を学習しましょう
          </p>
        </div>

        {/* メインアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MainActionCard
            title="学習開始"
            description="新しい単語を学習して語彙力を向上させましょう"
            icon={Play}
            href="/learning/categories"
            color="text-primary"
            bgColor="bg-primary/10"
            stats="新規"
          />
          <MainActionCard
            title="復習"
            description="間隔反復で記憶を定着させましょう"
            icon={RotateCcw}
            href="/review"
            color="text-orange-600"
            bgColor="bg-orange-100"
            stats="0個"
          />
          <MainActionCard
            title="単語検索"
            description="特定の単語を検索して学習しましょう"
            icon={Search}
            href="/search"
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
        </div>

        {/* 追加機能セクション */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            学習統計
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 学習単語数 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    学習単語数
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.studied_words || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* 復習待ち */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    復習待ち
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.review_count || 0}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* 正答率 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    正答率
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(stats?.average_accuracy || 0)}%
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* 連続学習日数 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    連続学習
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.current_streak || 0}日
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Flame className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 詳細統計 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              詳細統計
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">総単語数</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {stats?.total_words || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">マスター済み</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {stats?.mastered_words || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">お気に入り</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {stats?.favorite_words_count || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">学習セッション数</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {stats?.total_study_sessions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">最長連続記録</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {stats?.longest_streak || 0}日
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">学習時間</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.round((stats?.study_time_minutes || 0) / 60)}時間
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 空の状態 */}
        <div className="text-center py-12">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-muted-foreground mb-6">
            まだ学習データがありません。学習を開始して進捗を確認しましょう。
          </p>
          <Link href="/learning/categories">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              学習を始める
            </Button>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    serverLog.error('ダッシュボードページエラー', LogCategory.ERROR, { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
