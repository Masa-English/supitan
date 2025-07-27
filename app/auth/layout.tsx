import { ReactNode } from 'react';
import { Footer } from '@/components/common';
import { Header } from '@/components/common/header';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      <Footer variant="minimal" showThemeSwitcher={false} />
    </div>
  );
} 