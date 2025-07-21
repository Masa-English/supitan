'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings, Play, Pause, Square, Volume1, Volume } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';

interface AudioControlsProps {
  className?: string;
  showQuickControls?: boolean;
}

export function AudioControls({ className = '', showQuickControls = true }: AudioControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const {
    isEnabled,
    volume,
    rate,
    pitch,
    currentUtterance,
    initialize,
    setEnabled,
    setVolume,
    setRate,
    setPitch,
    getVoices,
    setVoice,
    selectedVoice,
    stop,
    pause,
    resume
  } = useAudioStore();

  useEffect(() => {
    initialize();
    setVoices(getVoices());
  }, [initialize, getVoices]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceIndex = parseInt(e.target.value);
    const voice = voices[selectedVoiceIndex];
    if (voice) {
      setVoice(voice);
    }
  };

  const isPlaying = currentUtterance !== null;

  // 音量アイコンの選択
  const getVolumeIcon = () => {
    if (!isEnabled) return <VolumeX className="h-4 w-4" />;
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.3) return <Volume className="h-4 w-4" />;
    if (volume < 0.7) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className={`relative ${className}`}>
      {/* メインボタン */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEnabled(!isEnabled)}
          className={`${isEnabled ? 'text-green-600' : 'text-gray-400'} hover:bg-green-50 dark:hover:bg-green-900/20`}
        >
          {getVolumeIcon()}
        </Button>

        {isEnabled && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? pause : resume}
              disabled={!isPlaying}
              className="text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={stop}
              disabled={!isPlaying}
              className="text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* クイックコントロール */}
      {showQuickControls && isEnabled && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">速度</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
              {rate}x
            </span>
          </div>
        </div>
      )}

      {/* 設定パネル */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
            音声設定
          </h3>

          {/* 音声選択 */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              音声
            </label>
            <select
              value={voices.findIndex(v => v === selectedVoice)}
              onChange={handleVoiceChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* 音量 */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              音量: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 速度 */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              速度: {rate}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* ピッチ */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              ピッチ: {pitch}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={handlePitchChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 現在の設定表示 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>選択中: {selectedVoice?.name || 'なし'}</div>
            <div>言語: {selectedVoice?.lang || 'なし'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 