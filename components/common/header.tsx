'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeft, User, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/common/theme-switcher';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useHeader } from '@/lib/contexts/header-context';
import { signOut } from '@/app/auth/actions';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  title: propTitle = "英単語学習",
  showBackButton = false,
  onBackClick,
  userEmail,
  onSignOut,
  showUserInfo = true,
  showMobileMenu = false,
  onMobileMenuToggle,
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
  const [isClient, setIsClient] = useState(false);
  const supabase = createClient();
  
  // デフォルト値を使用（SSR/CSR互換性のため）
  const title = propTitle !== "英単語学習" ? propTitle : "ダッシュボード";
  const showProgress = propShowProgress || false;
  const progress = propProgress || 0;
  const currentIndex = propCurrentIndex || 0;
  const totalCount = propTotalCount || 0;

  // ハイドレーションエラーを防ぐため、クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect((): (() => void) | undefined => {
    // クライアントサイドでのみ実行
    if (isClient) {
      // 現在のユーザーを取得
      const getCurrentUser = async () => {
        try {
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
  }, [isClient, supabase.auth]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // 現在のパスに基づいて戻るボタンの表示を決定
  const shouldShowBackButton = (): boolean => {
    if (onBackClick) {
      return showBackButton;
    }
    
    // ダッシュボードページでは戻るボタンを表示しない
    if (pathname === '/dashboard') {
      return false;
    }
    
    // その他のページでは戻るボタンを表示
    return showBackButton;
  };

  // 現在のパスに基づいてモバイルメニューの表示を決定
  const shouldShowMobileMenu = () => {
    // ダッシュボードページでもモバイルメニューを表示（サイドメニュー開閉用）
    return showMobileMenu;
  };

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
    return;
  };

  const handleHomeClick = () => {
    if (currentUser) {
      router.push('/dashboard');
      return;
    }
    router.push('/landing');
  };

  // ユーザー情報の取得（propsまたは現在のユーザーから）
  const displayUserEmail = userEmail || currentUser?.email;
  const isLoggedIn = !!displayUserEmail;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* プログレス表示 */}
          {showProgress && (
            <div className="absolute top-full left-0 right-0 bg-muted/50 border-b border-border px-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {currentIndex} / {totalCount}
                </span>
                <span className="text-sm text-primary">
                  {Math.round(progress)}% 完了
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* モバイルメニューボタン */}
            {shouldShowMobileMenu() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={_onSideMenuToggle || onMobileMenuToggle || toggleSideMenu}
                className="lg:hidden text-muted-foreground hover:bg-accent transition-all duration-200 hover:scale-105 p-2 touch-target"
              >
                <Menu className="h-5 w-5 transition-transform duration-200 hover:rotate-90" />
              </Button>
            )}
            
            {shouldShowBackButton() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-muted-foreground hover:bg-accent transition-colors p-2 sm:px-3 touch-target"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
            )}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity touch-friendly"
              onClick={handleHomeClick}
            >
              <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  スピ単
                </h1>
                {title !== "英単語学習" && (
                  <p className="text-xs sm:text-sm text-muted-foreground -mt-0.5">
                    {title}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {showUserInfo && isClient && (
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher />
              
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:bg-accent transition-colors border border-border hover:border-primary/50 p-2 sm:px-3 touch-target"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="hidden sm:inline font-medium">
                          {displayUserEmail?.split('@')[0] || 'ユーザー'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 sm:w-64 bg-card/95 backdrop-blur-md border border-border shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {displayUserEmail?.split('@')[0] || 'ユーザー'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {displayUserEmail}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/profile')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent touch-target"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      プロフィール設定
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/review')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent touch-target"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent touch-target"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 現在のパスからカテゴリーを取得してカテゴリーページに戻る
                        if (pathname.match(/^\/dashboard\/category\/[^\/]+\/(flashcard|quiz|browse)$/)) {
                          const category = pathname.split('/')[3];
                          router.push(`/dashboard/category/${category}`);
                        } else {
                          router.push('/dashboard');
                        }
                      }}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent touch-target"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      カテゴリーに戻る
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={onSignOut || handleSignOut} 
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 touch-target"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/auth/login')} 
                  className="border-border text-muted-foreground hover:bg-accent transition-colors p-2 sm:px-3 touch-target"
                >
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">ログイン</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 