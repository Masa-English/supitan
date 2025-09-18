/**
 * ヘッダーのナビゲーションコンポーネント
 * 戻るボタンとホームボタンの管理
 */

'use client';

import { ArrowLeft, Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderNavigationProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  currentUser: SupabaseUser | null;
  title: string;
}

export function HeaderNavigation({
  showBackButton = false,
  onBackClick,
  showMobileMenu = false,
  onMobileMenuToggle,
  currentUser,
  title,
}: HeaderNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const startNavigating = useNavigationStore((s) => s.start);

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

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    
    // 学習ページからはカテゴリーページに戻る
    if (pathname.match(/^\/learning\/[^\/]+\/(flashcard|quiz|browse)$/)) {
      const category = pathname.split('/')[2];
      startNavigating();
      router.push(`/learning/${category}`);
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
    // 未認証ユーザーはランディングページに戻る
    startNavigating();
    router.push('/');
  };

  return (
    <div className="flex items-center gap-2">
      {/* モバイルメニューボタン */}
      {showMobileMenu && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="md:hidden hover:bg-primary/10 transition-colors"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* 戻るボタン */}
      {shouldShowBackButton() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="hover:bg-primary/10 transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {/* ホーム/ロゴボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHomeClick}
        className="flex items-center gap-2 hover:bg-primary/10 transition-colors font-semibold"
      >
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-lg">{title}</span>
      </Button>
    </div>
  );
}
