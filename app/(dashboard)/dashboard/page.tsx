import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Search,
  Clock,
  CheckCircle2,
  Target,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import serverLog, { LogCategory } from '@/lib/utils/server-logger';
import { DatabaseService } from '@/lib/api/database';
import { dataProvider } from '@/lib/api/services/data-provider';
import { Progress } from '@/components/ui/feedback/progress';

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
    const [stats, learningRecords] = await Promise.all([
      getUserStats(user.id),
      dataProvider.getLearningRecords(user.id, 30),
    ]);

    const hasLearningData = Boolean(
      (learningRecords?.summary.last7Days.completedCount ?? 0) > 0 ||
      (learningRecords?.summary.last7Days.studyMinutes ?? 0) > 0
    );

    const last7Days = learningRecords?.daily.slice(0, 7) ?? []; // 最新から直近7日
    const displayDays = last7Days; // そのまま（最新が上）

    const formatAccuracy = (completed: number, accuracy?: number) => {
      if (!completed || completed <= 0) return '—';
      const val = accuracy ?? 0;
      return `${val.toFixed(1)}%`;
    };
    const maxCompleted = Math.max(
      ...last7Days.map(day => day.completedCount),
      1
    );

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
            color="text-[hsl(var(--primary))]"
            bgColor="bg-[hsl(var(--primary)/0.14)] dark:bg-[hsl(var(--primary)/0.22)]"
            stats="新規"
          />
          <MainActionCard
            title="復習"
            description="間隔反復で記憶を定着させましょう"
            icon={RotateCcw}
            href="/review"
            color="text-[hsl(var(--chart-2))]"
            bgColor="bg-[hsl(var(--chart-2)/0.14)] dark:bg-[hsl(var(--chart-2)/0.20)]"
            stats="0個"
          />
          <MainActionCard
            title="単語検索"
            description="特定の単語を検索して学習しましょう"
            icon={Search}
            href="/search"
            color="text-[hsl(var(--chart-5))]"
            bgColor="bg-[hsl(var(--chart-5)/0.14)] dark:bg-[hsl(var(--chart-5)/0.20)]"
          />
        </div>

        {/* 学習記録サマリ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">今日の学習</p>
                <Clock className="w-5 h-5 text-primary" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {learningRecords?.summary.today.completedCount ?? 0} 問
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>完了 {learningRecords?.summary.today.completedCount ?? 0} 問</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary text-xs font-mono tabular-nums">
                  <Target className="w-3 h-3" aria-hidden />
                  {formatAccuracy(
                    learningRecords?.summary.today.completedCount ?? 0,
                    learningRecords?.summary.today.accuracy
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">直近7日の合計</p>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {learningRecords?.summary.last7Days.completedCount ?? 0} 問
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>完了 {learningRecords?.summary.last7Days.completedCount ?? 0} 問</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-300 text-xs font-mono tabular-nums">
                  正答率 {formatAccuracy(
                    learningRecords?.summary.last7Days.completedCount ?? 0,
                    learningRecords?.summary.last7Days.accuracy
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">累計</p>
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-foreground flex items-baseline gap-2">
                <span className="leading-none">
                  {(learningRecords?.summary.lifetime.completedCount ?? 0).toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground leading-none">
                  / {(stats?.total_words ?? 0).toLocaleString()} 問
                </span>
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span>
                  完了 {(learningRecords?.summary.lifetime.completedCount ?? 0).toLocaleString()} 問 / 全 {(stats?.total_words ?? 0).toLocaleString()} 問
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-blue-600 dark:text-blue-300 text-xs font-mono tabular-nums">
                  正答率 {formatAccuracy(
                    learningRecords?.summary.lifetime.completedCount ?? 0,
                    learningRecords?.summary.lifetime.accuracy
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 直近7日の日別ログ */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">直近7日の学習記録</p>
                <p className="text-xs text-muted-foreground">完了数・正答率のスナップショット</p>
              </div>
              <Target className="w-5 h-5 text-primary" aria-hidden />
            </div>
            {hasLearningData ? (
              <div className="space-y-3">
                {displayDays.map(day => (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm gap-3">
                      <span className="font-medium w-16 shrink-0">{day.displayDate}</span>
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="font-mono tabular-nums">{day.completedCount}問</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-[11px] font-mono tabular-nums min-w-[64px] justify-center">
                          {formatAccuracy(day.completedCount, day.accuracy)}
                        </span>
                      </span>
                    </div>
                    <Progress
                      value={(day.completedCount / maxCompleted) * 100}
                      className="h-2"
                      aria-label={`${day.displayDate} の完了数`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                直近の学習データがまだありません。学習を開始して記録を蓄積しましょう。
              </div>
            )}
          </CardContent>
        </Card>

        {/* 空の状態 */}
        {!hasLearningData && (
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
        )}
      </div>
    );
  } catch (error) {
    serverLog.error('ダッシュボードページエラー', LogCategory.ERROR, { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
