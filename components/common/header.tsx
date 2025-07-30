'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, BookOpen, User, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeSwitcher } from './theme-switcher';
import { useHeader } from '@/lib/contexts/header-context';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userEmail?: string;
  onSignOut?: () => void;
  showUserInfo?: boolean;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  showProgress?: boolean;
  progress?: number;
  currentIndex?: number;
  totalCount?: number;
  _isSideMenuOpen?: boolean;
  _onSideMenuToggle?: () => void;
}

export function Header({
  title: _propTitle = "英単語学習",
  showBackButton = false,
  onBackClick,
  userEmail: _userEmail,
  onSignOut: _onSignOut,
  showUserInfo = true,
  showMobileMenu = false,
  onMobileMenuToggle: _onMobileMenuToggle,
  showProgress: propShowProgress = false,
  progress: propProgress = 0,
  currentIndex: propCurrentIndex = 0,
  totalCount: propTotalCount = 0,
  _isSideMenuOpen,
  _onSideMenuToggle
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSideMenu } = useHeader();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  // contextSideMenuOpenは未使用だが、useHeaderフックの戻り値として必要
  const supabase = createClient();
  // デフォルト値を使用（SSR/CSR互換性のため）
  const showProgress = propShowProgress || false;
  const progress = propProgress || 0;
  const currentIndex = propCurrentIndex || 0;
  const totalCount = propTotalCount || 0;

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // 現在のユーザーを取得
      const getCurrentUser = async () => {
        try {
          // getSession()を使用してセッションを確認
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('ユーザー取得エラー:', error);
          } else if (session?.user) {
            setCurrentUser(session.user);
          }
        } catch (error) {
          console.error('ユーザー取得エラー:', error);
        }
      };

      getCurrentUser();

      // 認証状態の変更を監視
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setCurrentUser(session?.user || null);
        }
      );

      return () => subscription.unsubscribe();
    }
    return undefined;
  }, [supabase.auth]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    
    // 学習ページからはカテゴリーページに戻る
    if (pathname.match(/^\/dashboard\/category\/[^\/]+\/(flashcard|quiz|browse)$/)) {
      const category = pathname.split('/')[3];
      router.push(`/dashboard/category/${category}`);
      return;
    }
    // カテゴリーページからはダッシュボードに戻る
    if (pathname.match(/^\/dashboard\/category\/[^\/]+$/)) {
      router.push('/dashboard');
      return;
    }
    // start-learningページからはダッシュボードに戻る
    if (pathname === '/dashboard/start-learning') {
      router.push('/dashboard');
      return;
    }
    // その他の場合は履歴に戻る
    router.back();
  };

  const handleHomeClick = () => {
    if (currentUser) {
      router.push('/dashboard');
      return;
    }
    router.push('/landing');
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* プログレス表示 - スマホでの位置最適化 */}
          {showProgress && (
            <div className="absolute top-full left-0 right-0 bg-muted/50 border-b border-border px-3 sm:px-4 py-1.5 sm:py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {currentIndex} / {totalCount}
                </span>
                <span className="text-xs sm:text-sm text-primary">
                  {Math.round(progress)}% 完了
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 左側 - ナビゲーション */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* モバイルメニューボタン */}
            {showMobileMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSideMenu}
                className="lg:hidden text-muted-foreground hover:bg-accent transition-colors p-1.5 sm:p-2 touch-target"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* 戻るボタン */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-muted-foreground hover:bg-accent transition-colors p-1.5 sm:p-2 touch-target"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {/* ホームリンク */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleHomeClick}
            >
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Masa Flash
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  ダッシュボード
                </p>
              </div>
            </div>
          </div>

          {/* 右側 - ユーザー情報とテーマ切り替え */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ユーザー情報 */}
            {showUserInfo && currentUser && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{currentUser.email}</p>
                    <p className="text-xs text-muted-foreground">学習者</p>
                  </div>
                </div>
                
                {/* モバイル用ユーザーアイコン */}
                <div className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* テーマ切り替え */}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 