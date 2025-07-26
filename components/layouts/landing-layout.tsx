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
    <BaseLayout className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              Masa Flash
            </h1>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
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