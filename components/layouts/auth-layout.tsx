import { ReactNode } from 'react';
import { BaseLayout } from './base-layout';
import { Footer } from '../common';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <BaseLayout className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ヘッダー */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/landing"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Masa Flash
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* フッター */}
      <Footer variant="minimal" showThemeSwitcher={false} />
    </BaseLayout>
  );
} 