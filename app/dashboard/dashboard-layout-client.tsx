'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common';
import { HeaderProvider, useHeader } from '@/lib/contexts/header-context';
import { 
  Play, 
  RotateCcw, 
  BookOpen, 
  Search, 
  Heart,
  BarChart3, 
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// サイドメニューコンポーネント
function SideMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const menuItems = [
    {
      title: '学習',
      items: [
        { label: '学習開始', href: '/dashboard/start-learning', icon: Play },
        { label: '復習', href: '/dashboard/review', icon: RotateCcw },
        { label: '単語一覧', href: '/dashboard/category', icon: BookOpen },
        { label: '検索', href: '/dashboard/search', icon: Search },
      ]
    },
    {
      title: '管理',
      items: [
        { label: 'お気に入り', href: '/dashboard/favorites', icon: Heart },
        { label: '統計', href: '/dashboard/statistics', icon: BarChart3 },
        { label: 'プロフィール', href: '/dashboard/profile', icon: User },
      ]
    }
  ];

  return (
    <>
      {/* オーバーレイ（モバイル用） */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-16 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドメニュー */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 bg-background border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:top-0 lg:h-full
        w-64
      `}>
        <div className="h-full flex flex-col">
          {/* ナビゲーション */}
          <nav className="flex-1 p-4">
            <div className="space-y-6">
              {menuItems.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              isActive 
                                ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                            onClick={() => {
                              // モバイルではメニューを閉じる
                              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                onClose();
                              }
                            }}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* フッター - モバイルのみ */}
          <div className="border-t border-border p-4 lg:hidden">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 Masa Flash
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// リダイレクト処理を行うコンポーネント
function RedirectHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // 保存されたリダイレクト先がある場合はそこに遷移
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        console.log('ダッシュボードから保存されたリダイレクト先に遷移:', redirectPath);
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      }
    }
  }, [router]);

  return <>{children}</>;
}

// ダッシュボードレイアウトの内部コンポーネント
function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const { isSideMenuOpen, setIsSideMenuOpen } = useHeader();
  const pathname = usePathname();

  // 学習ページではフッターを非表示
  const isLearningPage = pathname.includes('/flashcard') || pathname.includes('/quiz');

  return (
    <RedirectHandler>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ヘッダー */}
        <Header 
          showBackButton={true}
          showUserInfo={true}
          showMobileMenu={true}
        />
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 flex">
          {/* サイドメニュー */}
          <SideMenu 
            isOpen={isSideMenuOpen} 
            onClose={() => setIsSideMenuOpen(false)} 
          />
          
          {/* メインコンテンツ */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* コンテンツ */}
            <div className="flex-1">
              {children}
            </div>
            
            {/* フッター - 学習ページ以外で表示 */}
            {!isLearningPage && (
              <div className="lg:hidden">
                <Footer variant="minimal" showThemeSwitcher={false} />
              </div>
            )}
          </main>
        </div>
        
        {/* デスクトップ用フッター */}
        {!isLearningPage && (
          <div className="hidden lg:block">
            <Footer />
          </div>
        )}
      </div>
    </RedirectHandler>
  );
}

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return (
    <HeaderProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </HeaderProvider>
  );
} 