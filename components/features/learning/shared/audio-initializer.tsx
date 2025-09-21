'use client';

import { useAudio } from '@/lib/hooks';
import clientLogger from '@/lib/utils/client-logger';

interface AudioInitializerProps {
  children: React.ReactNode;
}

export function AudioInitializer({ children }: AudioInitializerProps) {
  const { isInitialized, isLoading } = useAudio({ 
    autoInitialize: true 
  });

  // 新しいログシステムを使用
  clientLogger.audio('AudioInitializer コンポーネントレンダリング', { isInitialized, isLoading });

  // Audio initialization is now handled automatically by the hook
  // through the autoInitialize option

  return <>{children}</>;
}