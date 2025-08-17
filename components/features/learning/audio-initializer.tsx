'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/lib/stores';

interface AudioInitializerProps {
  children: React.ReactNode;
}

export function AudioInitializer({ children }: AudioInitializerProps) {
  const { initializeAudio, isInitialized } = useAudioStore();

  console.log('[AudioInitializer] コンポーネントレンダリング', { isInitialized });

  useEffect(() => {
    console.log('[AudioInitializer] コンポーネントマウント', { isInitialized });
    
    if (!isInitialized) {
      console.log('[AudioInitializer] 音声初期化開始');
      initializeAudio();
    } else {
      console.log('[AudioInitializer] 音声は既に初期化済み');
    }
  }, [initializeAudio, isInitialized]);

  return <>{children}</>;
}
