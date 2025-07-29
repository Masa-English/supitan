'use client';

import { useEffect, useState } from 'react';
import { Word } from '@/lib/types';
import { useAudioStore } from '@/lib/audio-store';

interface AudioPreloaderProps {
  words: Word[];
  onLoadComplete?: () => void;
  onLoadProgress?: (loaded: number, total: number) => void;
}

export function AudioPreloader({ words, onLoadComplete, onLoadProgress }: AudioPreloaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const { loadWordAudio } = useAudioStore();

  useEffect(() => {
    const preloadAudioFiles = async () => {
      const audioWords = words.filter(word => word.audio_file);
      
      if (audioWords.length === 0) {
        onLoadComplete?.();
        return;
      }

      setIsLoading(true);
      setLoadedCount(0);

      try {
        // 並行して音声ファイルを読み込み
        const loadPromises = audioWords.map(async (word, _index) => {
          try {
            await loadWordAudio(word.id, word.audio_file!);
            setLoadedCount(prev => {
              const newCount = prev + 1;
              // コールバックをsetTimeoutで非同期に実行
              setTimeout(() => {
                onLoadProgress?.(newCount, audioWords.length);
              }, 0);
              return newCount;
            });
          } catch (error) {
            console.warn(`音声ファイル読み込みエラー: ${word.word}`, error);
            // エラーが発生してもカウントを進める
            setLoadedCount(prev => {
              const newCount = prev + 1;
              // コールバックをsetTimeoutで非同期に実行
              setTimeout(() => {
                onLoadProgress?.(newCount, audioWords.length);
              }, 0);
              return newCount;
            });
          }
        });

        await Promise.allSettled(loadPromises);
        onLoadComplete?.();
      } catch (error) {
        console.error('音声ファイル事前読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadAudioFiles();
  }, [words, onLoadComplete, onLoadProgress, loadWordAudio]); // loadWordAudioを依存配列に追加

  if (!isLoading) {
    return null;
  }

  const progress = (loadedCount / words.filter(w => w.audio_file).length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">音声ファイルを読み込み中...</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {loadedCount} / {words.filter(w => w.audio_file).length} ファイル
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 