'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/lib/stores';

interface AudioInitializerProps {
  children: React.ReactNode;
}

export function AudioInitializer({ children }: AudioInitializerProps) {
  const { initializeAudio, isInitialized } = useAudioStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAudio();
    }
  }, [initializeAudio, isInitialized]);

  return <>{children}</>;
}
