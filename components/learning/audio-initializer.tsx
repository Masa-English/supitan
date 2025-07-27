'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/lib/audio-store';

interface AudioInitializerProps {
  children?: React.ReactNode;
}

/**
 * クイズ画面でのみ音声ファイルを初期化するコンポーネント
 * このコンポーネントがマウントされた時のみ音声ファイルが読み込まれる
 */
export function AudioInitializer({ children }: AudioInitializerProps) {
  const { initializeAudio, cleanup } = useAudioStore();

  useEffect(() => {
    // コンポーネントマウント時に音声を初期化
    initializeAudio();

    // コンポーネントアンマウント時にクリーンアップ
    return () => {
      cleanup();
    };
  }, [initializeAudio, cleanup]);

  return <>{children}</>;
} 