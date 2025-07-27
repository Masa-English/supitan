'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';

interface AudioControlsProps {
  className?: string;
}

export function AudioControls({ className = '' }: AudioControlsProps) {
  const { 
    isMuted, 
    volume, 
    isLoading, 
    error, 
    initializeAudio, 
    toggleMute, 
    setVolume 
  } = useAudioStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // コンポーネントマウント時に音声を初期化
    if (!isInitialized) {
      initializeAudio();
      setIsInitialized(true);
    }
  }, [initializeAudio, isInitialized]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" />;
    } else if (volume < 0.5) {
      return <Volume1 className="h-4 w-4" />;
    } else {
      return <Volume2 className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <VolumeX className="h-4 w-4" />
        <span>音声無効</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* ミュートボタン */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        disabled={isLoading}
        className="p-2 h-auto"
        title={isMuted ? '音声を有効にする' : '音声を無効にする'}
      >
        {getVolumeIcon()}
      </Button>

      {/* 音量スライダー */}
      {!isMuted && (
        <div className="flex items-center gap-2 min-w-[80px]">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isLoading}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            title={`音量: ${Math.round(volume * 100)}%`}
          />
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      )}
    </div>
  );
} 