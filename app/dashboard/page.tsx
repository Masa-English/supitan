import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthWrapper } from '@/components/auth';
import { TutorialWrapper } from '../../components/common';
import { 
  Play, 
  RotateCcw, 
  BookOpen, 
  Search, 
  Target, 
  BarChart3, 
  // User,
  // Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';
// import { DashboardClient } from './dashboard-client';

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
  stats?: { value: string; label: string };
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card">
      <Link href={href} className="block">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${bgColor}`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
            </div>
            {stats && (
              <div className="text-right">
                <div className={`text-xl sm:text-2xl font-bold ${color}`}>{stats.value}</div>
                <div className="text-xs text-muted-foreground">{stats.label}</div>
              </div>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}

// クイックアクションセクション
function QuickActionsSection() {
  return (
    <section className="mb-4 sm:mb-6">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          クイックアクション
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          学習を効率的に進めるための主要なアクション
        </p>
      </div>
      
      <div className="mobile-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <MainActionCard
          title="学習開始"
          description="新しい単語をフラッシュカードとクイズで学習"
          icon={Play}
          href="/dashboard/start-learning"
          color="text-primary"
          bgColor="bg-primary/10"
          stats={{ value: "44", label: "学習可能" }}
        />
        
        <MainActionCard
          title="復習"
          description="間隔反復で学習した単語を定着させる"
          icon={RotateCcw}
          href="/dashboard/review"
          color="text-primary"
          bgColor="bg-primary/10"
          stats={{ value: "0", label: "復習待ち" }}
        />
        
        <MainActionCard
          title="単語検索"
          description="条件を指定して単語を検索・フィルタリング"
          icon={Search}
          href="/dashboard/search"
          color="text-primary"
          bgColor="bg-primary/10"
        />
      </div>
    </section>
  );
}

// 今日の進捗セクション
function TodayProgressSection() {
  return (
    <section className="mb-4 sm:mb-6">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          今日の進捗
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          今日の学習状況を確認しましょう
        </p>
      </div>
      
      <div className="mobile-grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">0</div>
                <div className="text-xs text-muted-foreground">学習済み</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">0</div>
                <div className="text-xs text-muted-foreground">正解率</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">0</div>
                <div className="text-xs text-muted-foreground">連続日数</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">0</div>
                <div className="text-xs text-muted-foreground">達成数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// 最近の活動セクション
function RecentActivitySection() {
  return (
    <section className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            最近の活動
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            最近の学習履歴を確認
          </p>
        </div>
        <Link href="/dashboard/statistics">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            詳細を見る
          </Button>
        </Link>
      </div>
      
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-4 sm:py-6">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-2">
              まだ学習履歴がありません
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              学習を開始して、あなたの進捗を追跡しましょう
            </p>
            <Link href="/dashboard/start-learning">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Play className="w-4 h-4 mr-2" />
                学習を開始
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <TutorialWrapper>
        <Suspense fallback={
          <div className="w-full p-3 sm:p-4 lg:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="h-24 sm:h-32 bg-muted animate-pulse rounded-lg" />
              <div className="h-36 sm:h-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-48 sm:h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        }>
          <main className="w-full p-3 sm:p-4 lg:p-6">
            {/* クイックアクション */}
            <QuickActionsSection />
            
            {/* 今日の進捗 */}
            <TodayProgressSection />
            
            {/* 最近の活動 */}
            <RecentActivitySection />
          </main>
        </Suspense>
      </TutorialWrapper>
    </AuthWrapper>
  );
}
