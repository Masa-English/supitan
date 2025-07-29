'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume, Settings } from 'lucide-react';
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
    toggleMute, 
    setVolume 
  } = useAudioStore();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // 外側クリックで音量スライダーを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeSlider]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" />;
    }
    if (volume < 0.3) {
      return <Volume className="h-4 w-4" />;
    }
    if (volume < 0.7) {
      return <Volume1 className="h-4 w-4" />;
    }
    return <Volume2 className="h-4 w-4" />;
  };

  const formatVolume = (vol: number) => {
    return Math.round(vol * 100);
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
        <Volume2 className="h-4 w-4 text-yellow-500" />
        <span>Web Speech API使用中</span>
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
        className="p-1 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
        title={isMuted ? 'ミュート解除' : 'ミュート'}
      >
        {getVolumeIcon()}
      </Button>
      
      {/* 音量調整エリア */}
      <div className="relative" ref={volumeRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
          title="音量調整"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* 音量スライダー */}
        {showVolumeSlider && (
          <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg p-3 shadow-lg z-50 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">音量</span>
              <span className="text-sm text-muted-foreground">{formatVolume(volume)}%</span>
            </div>
            
            <div className="space-y-3">
              {/* メイン音量スライダー */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume * 100}%, hsl(var(--muted)) ${volume * 100}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>
              
              {/* クイック設定ボタン */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(0)}
                  className="flex-1 text-xs px-2 py-1"
                >
                  0%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(0.25)}
                  className="flex-1 text-xs px-2 py-1"
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(0.5)}
                  className="flex-1 text-xs px-2 py-1"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(0.75)}
                  className="flex-1 text-xs px-2 py-1"
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(1)}
                  className="flex-1 text-xs px-2 py-1"
                >
                  100%
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 現在の音量表示（コンパクト） */}
      {!isMuted && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <span>{formatVolume(volume)}%</span>
        </div>
      )}
    </div>
  );
} 