'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common';
import { HeaderProvider } from '@/lib/contexts/header-context';

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return (
    <HeaderProvider>
      <div className="bg-background min-h-screen flex flex-col">
        <Header 
          showBackButton={true}
          showUserInfo={true}
          showMobileMenu={true}
        />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </div>
    </HeaderProvider>
  );
} 