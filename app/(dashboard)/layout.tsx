import { ReactNode } from 'react';
import { DashboardLayoutClient } from './dashboard/dashboard-layout-client';
import { HeaderProvider } from '@/lib/contexts/header-context';
import { PreloadResources } from '@/components/shared/preload-resources';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}