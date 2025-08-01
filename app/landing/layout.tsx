import { ReactNode } from 'react';
import { Footer } from '@/components/common';
import { Header } from '@/components/common/header';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/80">
      <Header />
      <main className="flex-1 w-full max-w-none py-8 sm:py-12 lg:py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
} 