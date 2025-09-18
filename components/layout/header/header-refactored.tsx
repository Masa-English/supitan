/**
 * リファクタリングされたヘッダーコンポーネント
 * 小さなコンポーネントに分割して保守性を向上
 */

'use client';

import { ThemeSwitcher } from '@/components/shared/theme-switcher';
import { useHeader } from '@/lib/contexts/header-context';
import { HeaderNavigation } from './header-navigation';
import { HeaderUserMenu } from './header-user-menu';
import { HeaderProgress } from './header-progress';
import { useHeaderAuth } from './header-auth-hooks';

interface HeaderRefactoredProps {
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
}

export function HeaderRefactored({
  title = "英単語学習",
  showBackButton = false,
  onBackClick,
  userEmail,
  onSignOut,
  showUserInfo = true,
  showThemeSwitcher = true,
  showMobileMenu = false,
  onMobileMenuToggle,
  showProgress = false,
  progress = 0,
  currentIndex = 0,
  totalCount = 0,
}: HeaderRefactoredProps) {
  const { toggleSideMenu } = useHeader();
  const { currentUser, isClient, handleSignOut } = useHeaderAuth();

  // SSRでは最小限のUI、CSRで完全なUIを表示
  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {showThemeSwitcher && <ThemeSwitcher />}
          </div>
        </div>
      </header>
    );
  }

  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    } else {
      toggleSideMenu();
    }
  };

  const handleUserSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await handleSignOut();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 左側: ナビゲーション */}
        <HeaderNavigation
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          showMobileMenu={showMobileMenu}
          onMobileMenuToggle={handleMobileMenuToggle}
          currentUser={currentUser}
          title={title}
        />

        {/* 中央: プログレスバー */}
        <HeaderProgress
          showProgress={showProgress}
          progress={progress}
          currentIndex={currentIndex}
          totalCount={totalCount}
        />

        {/* 右側: ユーザーメニューとテーマスイッチャー */}
        <div className="flex items-center gap-2">
          {showThemeSwitcher && <ThemeSwitcher />}
          
          <HeaderUserMenu
            user={currentUser}
            userEmail={userEmail}
            onSignOut={handleUserSignOut}
            showUserInfo={showUserInfo}
          />
        </div>
      </div>
    </header>
  );
}
