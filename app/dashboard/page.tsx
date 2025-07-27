'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthWrapper } from '@/components/auth';
import { TutorialWrapper } from '../../components/common';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  RotateCcw, 
  BookOpen, 
  Search, 
  Target, 
  BarChart3, 
  User,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';

// サイドメニューコンポーネント
function SideMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const menuItems = [
    {
      title: '学習',
      items: [
        { label: '学習開始', href: '/dashboard/start-learning', icon: Play, color: 'text-primary' },
        { label: '復習', href: '/dashboard/review', icon: RotateCcw, color: 'text-primary' },
        { label: '単語一覧', href: '/dashboard/category', icon: BookOpen, color: 'text-primary' },
        { label: '検索', href: '/dashboard/search', icon: Search, color: 'text-primary' },
      ]
    },
    {
      title: '管理',
      items: [
        { label: 'お気に入り', href: '/dashboard/favorites', icon: Heart, color: 'text-primary' },
        { label: '統計', href: '/dashboard/statistics', icon: BarChart3, color: 'text-primary' },
        { label: 'プロフィール', href: '/dashboard/profile', icon: User, color: 'text-primary' },
      ]
    }
  ];

  return (
    <>
      {/* オーバーレイ（モバイル用） */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドメニュー */}
      <div className={`
        fixed top-2 left-0 h-full z-50 bg-background border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* ナビゲーション */}
          <nav className="flex-1 space-y-4 sm:space-y-6">
            {menuItems.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          // モバイルではメニューを閉じる
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                      >
                        <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                        <span className="font-medium text-sm sm:text-base">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
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
    <section className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          クイックアクション
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          学習を効率的に進めるための主要なアクション
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <section className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          今日の進捗
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          今日の学習状況を確認しましょう
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">学習済み</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">正解率</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">連続日数</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">達成数</div>
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
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
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
          <div className="text-center py-6 sm:py-8">
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

export default function ProtectedPage() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <AuthWrapper>
      <TutorialWrapper>
        <RedirectHandler>
          <div className="min-h-screen bg-background">
            <div className="flex">
              {/* サイドメニュー */}
              <SideMenu 
                isOpen={isSideMenuOpen} 
                onClose={() => setIsSideMenuOpen(false)} 
              />
              
              {/* メインコンテンツ */}
              <div className="flex-1 lg:ml-0">
                <main className="p-4 sm:p-6 lg:p-8">
                  {/* クイックアクション */}
                  <QuickActionsSection />
                  
                  {/* 今日の進捗 */}
                  <TodayProgressSection />
                  
                  {/* 最近の活動 */}
                  <RecentActivitySection />
                </main>
              </div>
            </div>
          </div>
        </RedirectHandler>
      </TutorialWrapper>
    </AuthWrapper>
  );
}

// リダイレクト処理を行うコンポーネント
function RedirectHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    // 保存されたリダイレクト先がある場合はそこに遷移
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      console.log('ダッシュボードから保存されたリダイレクト先に遷移:', redirectPath);
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    }
  }, [router]);

  return <>{children}</>;
}
