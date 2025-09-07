'use client';

import { useAudio } from '@/lib/hooks';
import type { Word } from '@/lib/types';

interface AudioPreloaderProps {
  words: Word[];
  children: React.ReactNode;
}

export function AudioPreloader({ words, children }: AudioPreloaderProps) {
  const { preloadWordAudioPaths: _preloadWordAudioPaths } = useAudio({
    autoInitialize: true,
    preloadWords: words.map(word => ({
      id: word.id,
      audio_file: word.audio_file,
    }))
  });

  // The preloading is now handled automatically by the hook
  // through the preloadWords option

  return <>{children}</>;
}