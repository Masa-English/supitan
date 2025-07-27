'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, AlertCircle } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>音声初期化中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span>Web Speech API使用中</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="p-1 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        {getVolumeIcon()}
      </Button>
      
      {!isMuted && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
      )}
    </div>
  );
} 