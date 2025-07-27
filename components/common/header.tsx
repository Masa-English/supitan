'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, User, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/common/theme-switcher';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
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
}

export function Header({
  title = "英単語学習",
  showBackButton = false,
  onBackClick,
  userEmail,
  onSignOut,
  showUserInfo = true,
  showMobileMenu = false,
  onMobileMenuToggle
}: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // 現在のユーザーを取得
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('ユーザー取得エラー:', error);
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('ユーザー取得エラー:', error);
      } finally {

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
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/landing');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      // 現在のパスに基づいて適切な戻り先を決定
      const currentPath = window.location.pathname;
      
      // 学習ページからはカテゴリーページに戻る
      if (currentPath.match(/^\/dashboard\/category\/[^\/]+\/(flashcard|quiz|browse)$/)) {
        const category = currentPath.split('/')[3];
        router.push(`/dashboard/category/${category}`);
      }
      // カテゴリーページからはダッシュボードに戻る
      else if (currentPath.match(/^\/dashboard\/category\/[^\/]+$/)) {
        router.push('/dashboard');
      }
      // start-learningページからはダッシュボードに戻る
      else if (currentPath === '/dashboard/start-learning') {
        router.push('/dashboard');
      }
      // その他の場合は履歴に戻る
      else {
        router.back();
      }
    }
  };

  const handleHomeClick = () => {
    if (currentUser) {
      router.push('/dashboard');
    } else {
      router.push('/landing');
    }
  };

  // ユーザー情報の取得（propsまたは現在のユーザーから）
  const displayUserEmail = userEmail || currentUser?.email;
  const isLoggedIn = !!displayUserEmail;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* モバイルメニューボタン */}
            {showMobileMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileMenuToggle}
                className="lg:hidden text-muted-foreground hover:bg-accent transition-colors p-2 touch-target"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {showBackButton && (
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
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Masa Flash
                </h1>
                {title !== "英単語学習" && (
                  <p className="text-xs sm:text-sm text-muted-foreground -mt-0.5">
                    {title}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {showUserInfo && (
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
                      <BookOpen className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent touch-target"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
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