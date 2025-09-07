'use client';

import { Suspense, ReactNode } from 'react';
import { PageSkeleton, StatsCardSkeleton, CategoryCardSkeleton, WordCardSkeleton, LearningModeCardSkeleton } from '@/components/ui/feedback/skeleton';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: 'page' | 'stats' | 'categories' | 'words' | 'learning-modes';
}

const fallbackMap = {
  page: <PageSkeleton />,
  stats: (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  ),
  categories: (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  ),
  words: (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <WordCardSkeleton key={i} />
      ))}
    </div>
  ),
  'learning-modes': (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <LearningModeCardSkeleton key={i} />
      ))}
    </div>
  ),
};

export function SuspenseWrapper({ children, fallback, type = 'page' }: SuspenseWrapperProps) {
  const defaultFallback = fallbackMap[type];
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// 特定の用途に特化したSuspenseコンポーネント
export function StatsSuspense({ children }: { children: ReactNode }) {
  return <SuspenseWrapper type="stats">{children}</SuspenseWrapper>;
}

export function CategoriesSuspense({ children }: { children: ReactNode }) {
  return <SuspenseWrapper type="categories">{children}</SuspenseWrapper>;
}

export function WordsSuspense({ children }: { children: ReactNode }) {
  return <SuspenseWrapper type="words">{children}</SuspenseWrapper>;
}

export function LearningModesSuspense({ children }: { children: ReactNode }) {
  return <SuspenseWrapper type="learning-modes">{children}</SuspenseWrapper>;
}