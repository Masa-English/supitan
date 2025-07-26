import { ReactNode } from 'react';
import { BaseLayout } from './base-layout';
import { Footer } from '../common';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <BaseLayout className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {children}
      <Footer />
    </BaseLayout>
  );
} 