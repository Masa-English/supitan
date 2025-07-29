import { ReactNode } from 'react';
import { DashboardLayoutClient } from '@/app/dashboard/dashboard-layout-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
