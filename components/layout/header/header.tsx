'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeft, User, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';
import { ThemeSwitcher } from '@/components/shared/theme-switcher';
import { useAuth } from '@/lib/providers/auth-provider';
import { useHeader } from '@/lib/contexts/header-context';
import { signOut } from '@/app/(auth)/auth/actions';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userEmail?: string;
  onSignOut?: () => void;
  showUserInfo?: boolean;
  showThemeSwitcher?: boolean;
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
  showThemeSwitcher = true,
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
  const { user: currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const startNavigating = useNavigationStore((s) => s.start);
  
  // デフォルト値を使用（SSR/CSR互換性のため）
  const title = propTitle;
  const showProgress = propShowProgress || false;
  const progress = propProgress || 0;
  const currentIndex = propCurrentIndex || 0;
  const totalCount = propTotalCount || 0;

  // ハイドレーションエラーを防ぐため、クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);

    // 初回マウント時にモバイル判定を実行（768pxを基準に）
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 認証状態はAuthProviderで管理されるため、このuseEffectは不要

  const handleSignOut = async () => {
    try {
      await signOut();
      // redirect('/landing') はサーバーアクション側で発火
    } catch (error) {
      // Next.js は redirect 時に特殊なエラーを投げるため無視する
      const digest = (error as { digest?: string } | undefined)?.digest || '';
      const message = String((error as Error | undefined)?.message || '');
      if (digest.startsWith('NEXT_REDIRECT') || message.includes('NEXT_REDIRECT')) {
        return;
      }
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
    const result = showMobileMenu && isClient && isMobile;
    console.log('shouldShowMobileMenu:', {
      showMobileMenu,
      isClient,
      isMobile,
      result
    });
    return result;
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    
    // 学習ページからはカテゴリーページに戻る
    if (pathname.match(/^\/learning\/[^\/]+\/(flashcard|quiz|browse)$/)) {
      const categoryId = pathname.split('/')[2];
      startNavigating();
      router.push(`/learning/${categoryId}`);
      return;
    }
    // カテゴリーページからはダッシュボードに戻る
    if (pathname.match(/^\/dashboard\/category\/[^\/]+$/)) {
      startNavigating();
      router.push('/dashboard');
      return;
    }
    // learningページからはダッシュボードに戻る
    if (pathname === '/learning') {
      startNavigating();
      router.push('/dashboard');
      return;
    }
    // その他の場合は履歴に戻る
    router.back();
    return;
  };

  const handleHomeClick = () => {
    if (currentUser) {
      // 既にダッシュボードページにいる場合は遷移しない
      if (pathname === '/dashboard') {
        return;
      }
      startNavigating();
      router.push('/dashboard');
      return;
    }
    // 既にルートページにいる場合は遷移しない  
    if (pathname === '/') {
      return;
    }
    startNavigating();
    router.push('/');
  };

  // ユーザー情報の取得（propsまたは現在のユーザーから）
  const displayUserEmail = userEmail || currentUser?.email;
  const isLoggedIn = !!displayUserEmail;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky z-40 w-full" suppressHydrationWarning>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18" suppressHydrationWarning>
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
            {(() => {
              const show = shouldShowMobileMenu();
              console.log('モバイルメニューボタンをレンダリング:', show);
              return show;
            })() && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('ハンバーガーボタンがクリックされました');
                  console.log('isSideMenuOpen:', _isSideMenuOpen);
                  console.log('isMobile:', isMobile);
                  console.log('利用可能なハンドラー:', {
                    _onSideMenuToggle,
                    onMobileMenuToggle,
                    toggleSideMenu
                  });
                  const handler = _onSideMenuToggle || onMobileMenuToggle || toggleSideMenu;
                  if (handler) {
                    console.log('ハンドラーを実行します');
                    handler();
                  } else {
                    console.error('ハンドラーが見つかりません');
                  }
                }}
                className="md:hidden text-muted-foreground hover:bg-accent transition-all duration-200 hover:scale-105 p-2 rounded-md"
                aria-label="メニューを開く"
              >
                <Menu className="h-5 w-5 duration-200" />
              </button>
            )}
            
            {shouldShowBackButton() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-muted-foreground hover:bg-accent transition-colors p-2 sm:px-3"
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
                {isClient && (
                  <>
                    {title && title !== "英単語学習" && title !== "" && (
                      <p className="text-sm sm:text-base text-muted-foreground -mt-0.5">
                        {title}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {isClient && (
            <div className="flex items-center gap-2 sm:gap-3">
              {showThemeSwitcher ? <ThemeSwitcher /> : null}
              {showUserInfo ? (
                isLoggedIn ? (
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:bg-accent transition-colors border border-border hover:border-primary/50 p-2 sm:px-3 "
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
                      <p className="text-sm text-muted-foreground truncate">
                        {displayUserEmail}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (pathname !== '/dashboard/profile') {
                          startNavigating();
                          router.push('/dashboard/profile');
                        }
                      }}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent "
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      プロフィール設定
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        if (pathname !== '/dashboard/review') {
                          startNavigating();
                          router.push('/dashboard/review');
                        }
                      }}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent "
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        if (pathname !== '/dashboard') {
                          startNavigating();
                          router.push('/dashboard');
                        }
                      }}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent "
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 現在のパスからカテゴリーIDを取得してカテゴリーページに戻る
                        if (pathname.match(/^\/learning\/[^\/]+\/(flashcard|quiz|browse)$/)) {
                          const categoryId = pathname.split('/')[2];
                          startNavigating();
                          router.push(`/learning/${categoryId}`);
                        } else {
                          startNavigating();
                          router.push('/dashboard');
                        }
                      }}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent "
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      カテゴリーに戻る
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={onSignOut || handleSignOut} 
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 "
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
                    onClick={() => { startNavigating(); router.push('/auth/login'); }} 
                    className="border-border text-muted-foreground hover:bg-accent transition-colors p-2 sm:px-3 "
                  >
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">ログイン</span>
                  </Button>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}