'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/common';
import { SideMenu } from '@/app/dashboard/side-menu';
import { useHeader } from '@/lib/contexts/header-context';
import { 
  RotateCcw, 
  Search, 
  BarChart3, 
  User, 
  Zap
} from 'lucide-react';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { isSideMenuOpen, toggleSideMenu } = useHeader();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }
    return undefined;
  }, [isClient]);

  const navigationItems = [
    { label: '学習開始', href: '/dashboard/start-learning', icon: Zap, color: 'text-primary' },
    { label: '復習', href: '/dashboard/review', icon: RotateCcw, color: 'text-primary' },
    { label: '検索', href: '/dashboard/search', icon: Search, color: 'text-primary' },
    { 
      label: '統計', 
      href: '/dashboard/statistics', 
      icon: BarChart3, 
      color: 'text-primary',
      badge: '開発中'
    },
    { label: '単語一覧', href: '/dashboard/category', icon: Zap, color: 'text-primary' },
    { label: 'プロフィール', href: '/dashboard/profile', icon: User, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <Header 
        showMobileMenu={true}
        onMobileMenuToggle={toggleSideMenu}
        _isSideMenuOpen={isSideMenuOpen}
        _onSideMenuToggle={toggleSideMenu}
      />

      {/* メインコンテンツ */}
      <div className="flex flex-1">
        {/* サイドメニュー - デスクトップ */}
        {!isMobile && isClient && (
          <div className="hidden lg:block w-64 bg-card border-r border-border transition-all duration-300 ease-in-out">
            <SideMenu navigationItems={navigationItems} />
          </div>
        )}

        {/* モバイルサイドメニュー */}
        {isMobile && isClient && (
          <>
            {/* オーバーレイ */}
            <div 
              className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
                isSideMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={toggleSideMenu}
            />
            
            {/* サイドメニュー */}
            <div 
              className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-xl z-50 transition-transform duration-300 ease-in-out ${
                isSideMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <SideMenu navigationItems={navigationItems} />
            </div>
          </>
        )}

        {/* メインコンテンツエリア */}
        <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
} 