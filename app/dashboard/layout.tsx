import { ReactNode } from 'react';
import { DashboardLayoutClient } from '@/app/dashboard/dashboard-layout-client';
import { HeaderProvider } from '@/lib/contexts/header-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HeaderProvider>
  );
}
