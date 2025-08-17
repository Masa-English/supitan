'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/lib/stores';
import type { Word } from '@/lib/types';

interface AudioPreloaderProps {
  words: Word[];
  children: React.ReactNode;
}

export function AudioPreloader({ words, children }: AudioPreloaderProps) {
  const { preloadWordAudioPaths } = useAudioStore();

  useEffect(() => {
    if (words.length > 0) {
      // 音声ファイルパスを事前読み込み
      const wordsWithAudio = words.map(word => ({
        id: word.id,
        audio_file: word.audio_file,
      }));
      preloadWordAudioPaths(wordsWithAudio);
    }
  }, [words, preloadWordAudioPaths]);

  return <>{children}</>;
}
