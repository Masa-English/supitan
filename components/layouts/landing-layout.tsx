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
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">
              Masa Flash
            </h1>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* フッター */}
      <Footer />
    </BaseLayout>
  );
} 