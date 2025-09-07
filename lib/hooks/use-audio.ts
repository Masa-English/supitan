'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';

interface UseAudioOptions {
  autoInitialize?: boolean;
  preloadWords?: { id: string; audio_file: string | null }[];
  volume?: number;
  muted?: boolean;
}

interface UseAudioReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  isMuted: boolean;
  volume: number;
  isAudioEnabled: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  playCorrectSound: () => Promise<void>;
  playIncorrectSound: () => Promise<void>;
  playWordAudio: (wordId: string) => Promise<void>;
  preloadWordAudio: (wordId: string, audioFilePath: string) => Promise<HTMLAudioElement | null>;
  preloadWordAudioPaths: (words: { id: string; audio_file: string | null }[]) => void;
  
  // Controls
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  toggleAudioEnabled: () => void;
  cleanup: () => void;
  
  // Utilities
  canPlayAudio: boolean;
  getAudioStatus: () => {
    initialized: boolean;
    enabled: boolean;
    muted: boolean;
    volume: number;
  };
}

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const {
    autoInitialize = true,
    preloadWords = [],
    volume: initialVolume,
    muted: initialMuted
  } = options;

  const {
    isInitialized,
    isLoading,
    error,
    isMuted,
    volume,
    isAudioEnabled,
    initializeAudio,
    playCorrectSound: playCorrect,
    playIncorrectSound: playIncorrect,
    playWordAudio: playWord,
    loadWordAudio,
    preloadWordAudioPaths,
    toggleMute,
    setVolume: setStoreVolume,
    toggleAudioEnabled,
    cleanup
  } = useAudioStore();

  // Initialize audio on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize && !isInitialized && !isLoading) {
      initializeAudio();
    }
  }, [autoInitialize, isInitialized, isLoading, initializeAudio]);

  // Set initial volume if provided
  useEffect(() => {
    if (typeof initialVolume === 'number' && initialVolume !== volume) {
      setStoreVolume(initialVolume);
    }
  }, [initialVolume, volume, setStoreVolume]);

  // Set initial muted state if provided
  useEffect(() => {
    if (typeof initialMuted === 'boolean' && initialMuted !== isMuted) {
      toggleMute();
    }
  }, [initialMuted, isMuted, toggleMute]);

  // Preload word audio paths when words are provided
  useEffect(() => {
    if (preloadWords.length > 0) {
      preloadWordAudioPaths(preloadWords);
    }
  }, [preloadWords, preloadWordAudioPaths]);

  // Enhanced play functions with error handling
  const playCorrectSound = useCallback(async () => {
    try {
      await playCorrect();
    } catch (error) {
      console.error('Failed to play correct sound:', error);
    }
  }, [playCorrect]);

  const playIncorrectSound = useCallback(async () => {
    try {
      await playIncorrect();
    } catch (error) {
      console.error('Failed to play incorrect sound:', error);
    }
  }, [playIncorrect]);

  const playWordAudio = useCallback(async (wordId: string) => {
    try {
      await playWord(wordId);
    } catch (error) {
      console.error(`Failed to play word audio for ${wordId}:`, error);
    }
  }, [playWord]);

  const preloadWordAudio = useCallback(async (wordId: string, audioFilePath: string) => {
    try {
      return await loadWordAudio(wordId, audioFilePath);
    } catch (error) {
      console.error(`Failed to preload word audio for ${wordId}:`, error);
      return null;
    }
  }, [loadWordAudio]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setStoreVolume(clampedVolume);
  }, [setStoreVolume]);

  // Computed values
  const canPlayAudio = useMemo(() => {
    return isInitialized && isAudioEnabled && !isMuted;
  }, [isInitialized, isAudioEnabled, isMuted]);

  const getAudioStatus = useCallback(() => {
    return {
      initialized: isInitialized,
      enabled: isAudioEnabled,
      muted: isMuted,
      volume
    };
  }, [isInitialized, isAudioEnabled, isMuted, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if this is the last component using audio
      // In a real app, you might want to implement reference counting
    };
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    isMuted,
    volume,
    isAudioEnabled,
    
    // Actions
    initialize: initializeAudio,
    playCorrectSound,
    playIncorrectSound,
    playWordAudio,
    preloadWordAudio,
    preloadWordAudioPaths,
    
    // Controls
    toggleMute,
    setVolume,
    toggleAudioEnabled,
    cleanup,
    
    // Utilities
    canPlayAudio,
    getAudioStatus
  };
}

// Hook for simple audio playback without full audio store integration
export function useSimpleAudio() {
  const playSound = useCallback(async (audioUrl: string, volume: number = 0.7) => {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);

  const playAudioBlob = useCallback(async (audioBlob: Blob, volume: number = 0.7) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      
      // Clean up the URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      
      await audio.play();
    } catch (error) {
      console.error('Failed to play audio blob:', error);
    }
  }, []);

  return {
    playSound,
    playAudioBlob
  };
}