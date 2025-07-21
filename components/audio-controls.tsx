'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';

interface AudioControlsProps {
  className?: string;
  showQuickControls?: boolean;
}

export function AudioControls({ className = '', showQuickControls = false }: AudioControlsProps) {
  const {
    isEnabled,
    volume,
    rate,
    initialize,
    setEnabled,
    setVolume,
    setRate
  } = useAudioStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
  };

  // 音量アイコン
  const getVolumeIcon = () => {
    if (!isEnabled) return <VolumeX className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 音声ON/OFFボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEnabled(!isEnabled)}
        className={`${isEnabled ? 'text-green-600' : 'text-gray-400'} hover:bg-green-50 dark:hover:bg-green-900/20`}
      >
        {getVolumeIcon()}
      </Button>

      {/* クイックコントロールモードでは詳細設定を非表示 */}
      {!showQuickControls && (
        <>
          {/* 音量調整 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isEnabled}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
          
          {/* 速度調整 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">速度</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              disabled={!isEnabled}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
              {rate}x
            </span>
          </div>
        </>
      )}
    </div>
  );
} 