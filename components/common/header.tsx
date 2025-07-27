'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/common/theme-switcher';
import { createClient } from '@/lib/supabase/client';
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
}

export function Header({
  title = "英単語学習",
  showBackButton = false,
  onBackClick,
  userEmail,
  onSignOut,
  showUserInfo = true
}: HeaderProps) {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // AuthWrapperからユーザー情報を取得
    const authContext = document.querySelector('.auth-context');
    if (authContext) {
      const email = authContext.getAttribute('data-user-email');
      setCurrentUserEmail(email);
    }
  }, []);

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
      // カテゴリーページからはダッシュボードに戻る
      const currentPath = window.location.pathname;
          if (currentPath.match(/^\/dashboard\/category\/[^\/]+$/)) {
      router.push('/dashboard');
      } else {
        router.back();
      }
    }
  };

  const handleHomeClick = () => {
    router.push('/dashboard');
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-muted-foreground hover:bg-accent transition-colors px-2 sm:px-3"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
            )}
            <div 
              className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleHomeClick}
            >
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Masa Flash
                </h1>
                {title !== "英単語学習" && (
                  <p className="text-xs sm:text-sm text-muted-foreground -mt-1">
                    {title}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {showUserInfo && (
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher />
              
              {(currentUserEmail || userEmail) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:bg-accent transition-colors border border-border hover:border-primary/50 px-2 sm:px-3"
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                        </div>
                        <span className="hidden sm:inline font-medium">
                          {(currentUserEmail || userEmail)?.split('@')[0] || 'ユーザー'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 sm:w-64 bg-card/95 backdrop-blur-md border border-border shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {(currentUserEmail || userEmail)?.split('@')[0] || 'ユーザー'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUserEmail || userEmail}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/profile')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      プロフィール設定
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard/review')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/dashboard')}
                      className="text-muted-foreground hover:bg-accent focus:bg-accent"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={onSignOut || handleSignOut} 
                      className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
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
                  onClick={onSignOut || handleSignOut} 
                  className="border-border text-muted-foreground hover:bg-accent transition-colors px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 