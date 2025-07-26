import { ReactNode } from 'react';
import { BaseLayout } from './base-layout';
import { Footer } from '../common';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <BaseLayout className="bg-background">
      {children}
      <Footer />
    </BaseLayout>
  );
} 