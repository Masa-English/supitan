'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/lib/contexts/header-context';
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
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-[55] lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドメニュー */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] z-[60] bg-background border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:top-0 lg:h-full
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
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
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

interface DashboardClientProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardClientProps) {
  const { isSideMenuOpen, setIsSideMenuOpen } = useHeader();

  return (
    <RedirectHandler>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* サイドメニュー - デスクトップでは常に表示、モバイルでは閉じた状態 */}
          <SideMenu 
            isOpen={isSideMenuOpen} 
            onClose={() => setIsSideMenuOpen(false)} 
          />
          
          {/* メインコンテンツ */}
          <div className="flex-1 lg:ml-0">
            {children}
          </div>
        </div>
      </div>
    </RedirectHandler>
  );
} 