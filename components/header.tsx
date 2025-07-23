'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme-switcher';
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

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleHomeClick = () => {
    router.push('/protected');
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-amber-200 dark:border-amber-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleHomeClick}
            >
              <BookOpen className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  Masa Flash
                </h1>
                {title !== "英単語学習" && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 -mt-1">
                    {title}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {showUserInfo && (
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              
              {userEmail && onSignOut ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20 transition-colors border border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <span className="hidden sm:inline font-medium">
                          {userEmail?.split('@')[0] || 'ユーザー'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-amber-200 dark:border-amber-700 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {userEmail?.split('@')[0] || 'ユーザー'}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-700" />
                    <DropdownMenuItem 
                      onClick={() => router.push('/protected/profile')}
                      className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      プロフィール設定
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/protected/review')}
                      className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/protected')}
                      className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-700" />
                    <DropdownMenuItem 
                      onClick={onSignOut} 
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                onSignOut && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onSignOut} 
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ログアウト
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 