import { ReactNode } from 'react';
import { BaseLayout } from './base-layout';
import { Footer } from '../common';
import { Button } from '../ui/button';
import Link from 'next/link';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <BaseLayout className="bg-gradient-to-br from-background to-background/80">
      {/* ヘッダー */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Masa Flash
              </h1>
            </Link>
            <div className="flex gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target"
                >
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target"
                >
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* フッター */}
      <Footer />
    </BaseLayout>
  );
} 