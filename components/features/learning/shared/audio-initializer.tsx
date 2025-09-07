'use client';

import { useAudio } from '@/lib/hooks';

interface AudioInitializerProps {
  children: React.ReactNode;
}

export function AudioInitializer({ children }: AudioInitializerProps) {
  const { isInitialized, isLoading } = useAudio({ 
    autoInitialize: true 
  });

  console.log('[AudioInitializer] コンポーネントレンダリング', { isInitialized, isLoading });

  // Audio initialization is now handled automatically by the hook
  // through the autoInitialize option

  return <>{children}</>;
}