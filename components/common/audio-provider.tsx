'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/lib/audio-store';

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const { initializeAudio } = useAudioStore();

  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  return <>{children}</>;
} 