import { ReactNode } from 'react';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
