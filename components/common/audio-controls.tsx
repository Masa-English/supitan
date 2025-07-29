'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';
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

  // const [isHovering, setIsHovering] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

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
    <div 
      className={`flex items-center gap-3 ${className}`}
      ref={volumeRef}
      // onMouseEnter={() => setIsHovering(true)}
      // onMouseLeave={() => setIsHovering(false)}
    >
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
      
      {/* 音量スライダー - 常に表示 */}
      <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[140px]">
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
          title={`音量: ${formatVolume(volume)}%`}
        />
        
        {/* 音量パーセンテージ表示 */}
        <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem] text-right">
          {formatVolume(volume)}%
        </span>
      </div>
    </div>
  );
} 