'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, User, LogOut, Settings } from 'lucide-react';
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
                      className="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{userEmail.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem disabled>
                      <User className="h-4 w-4 mr-2" />
                      {userEmail}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/protected/review')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      復習
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/protected')}>
                      <Settings className="h-4 w-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut} className="text-red-600 dark:text-red-400">
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