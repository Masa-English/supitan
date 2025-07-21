'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-amber-200 dark:border-amber-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            )}
            <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-amber-600" />
              {title}
            </h1>
          </div>
          
          {showUserInfo && (
            <div className="flex items-center gap-4">
              {userEmail && (
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  {userEmail}
                </span>
              )}
              {onSignOut && (
                <Button 
                  variant="outline" 
                  onClick={onSignOut} 
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20"
                >
                  ログアウト
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 