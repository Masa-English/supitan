'use client';

import { StatisticsDashboard } from '@/components/features/learning/shared/statistics-dashboard';
import { useUserStore } from '@/lib/stores';

export function StatisticsWrapper() {
  const stats = useUserStore((state) => state.stats);
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">統計データを読み込み中...</p>
      </div>
    );
  }
  
  return <StatisticsDashboard stats={stats} />;
}