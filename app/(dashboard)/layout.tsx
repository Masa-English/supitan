import { ReactNode } from 'react';
import { DashboardLayoutClient } from './dashboard/dashboard-layout-client';
import { HeaderProvider } from '@/lib/contexts/header-context';
import { PreloadResources } from '@/components/shared/preload-resources';
import { AuthProvider } from '@/lib/providers/auth-provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <HeaderProvider>
        <PreloadResources routes={[
          '/learning/categories',
          '/review',
          '/search',
          '/statistics',
          '/history',
          '/profile',
          '/settings'
        ]} />
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </HeaderProvider>
    </AuthProvider>
  );
}