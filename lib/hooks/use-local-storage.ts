'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LocalStorageHelper } from '@/lib/utils/storage';

interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  prefix?: string;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
}

export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    defaultValue,
    serializer,
    prefix = 'masa_flash_'
  } = options;

  const storage = useMemo(() => new LocalStorageHelper(prefix), [prefix]);
  
  const [value, setInternalValue] = useState<T>(defaultValue as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if localStorage is available
  useEffect(() => {
    try {
      const available = typeof window !== 'undefined' && 'localStorage' in window;
      setIsAvailable(available);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  // Load initial value from localStorage
  useEffect(() => {
    if (!isAvailable) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      if (serializer) {
        // Use custom serializer
        const item = window.localStorage.getItem(`${prefix}${key}`);
        if (item !== null) {
          const deserializedValue = serializer.deserialize(item);
          setInternalValue(deserializedValue);
        } else if (defaultValue !== undefined) {
          setInternalValue(defaultValue);
        }
      } else {
        // Use built-in storage helper
        const storedValue = storage.get<T>(key);
        if (storedValue !== null) {
          setInternalValue(storedValue);
        } else if (defaultValue !== undefined) {
          setInternalValue(defaultValue);
        }
      }
    } catch (err) {
      console.error(`Error loading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to load from localStorage');
      if (defaultValue !== undefined) {
        setInternalValue(defaultValue);
      }
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue, isAvailable, storage, serializer, prefix]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (!isAvailable) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      setError(null);
      
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;

      if (serializer) {
        // Use custom serializer
        const serializedValue = serializer.serialize(valueToStore);
        window.localStorage.setItem(`${prefix}${key}`, serializedValue);
      } else {
        // Use built-in storage helper
        storage.set(key, valueToStore);
      }
      
      setInternalValue(valueToStore);
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to save to localStorage');
    }
  }, [key, value, isAvailable, storage, serializer, prefix]);

  const removeValue = useCallback(() => {
    if (!isAvailable) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      setError(null);
      
      if (serializer) {
        window.localStorage.removeItem(`${prefix}${key}`);
      } else {
        storage.remove(key);
      }
      
      if (defaultValue !== undefined) {
        setInternalValue(defaultValue);
      }
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Failed to remove from localStorage');
    }
  }, [key, defaultValue, isAvailable, storage, serializer, prefix]);

  return {
    value,
    setValue,
    removeValue,
    loading,
    error,
    isAvailable
  };
}

// Specialized hooks for common use cases
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  return useLocalStorage(key, { defaultValue });
}

export function useLocalStorageBoolean(key: string, defaultValue: boolean = false) {
  return useLocalStorage(key, { defaultValue });
}

export function useLocalStorageNumber(key: string, defaultValue: number = 0) {
  return useLocalStorage(key, { defaultValue });
}

export function useLocalStorageString(key: string, defaultValue: string = '') {
  return useLocalStorage(key, { defaultValue });
}

export function useLocalStorageArray<T>(key: string, defaultValue: T[] = []) {
  return useLocalStorage(key, { defaultValue });
}

export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string, 
  defaultValue: T
) {
  return useLocalStorage(key, { defaultValue });
}

// Hook for managing multiple localStorage keys with a common prefix
export function useLocalStorageManager(prefix: string = 'masa_flash_') {
  const storage = useMemo(() => new LocalStorageHelper(prefix), [prefix]);
  
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      const available = typeof window !== 'undefined' && 'localStorage' in window;
      setIsAvailable(available);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  const get = useCallback(<T>(key: string): T | null => {
    if (!isAvailable) return null;
    return storage.get<T>(key);
  }, [storage, isAvailable]);

  const set = useCallback(<T>(key: string, value: T): boolean => {
    if (!isAvailable) return false;
    return storage.set(key, value);
  }, [storage, isAvailable]);

  const remove = useCallback((key: string): boolean => {
    if (!isAvailable) return false;
    return storage.remove(key);
  }, [storage, isAvailable]);

  const clear = useCallback((): boolean => {
    if (!isAvailable) return false;
    return storage.clear();
  }, [storage, isAvailable]);

  const has = useCallback((key: string): boolean => {
    if (!isAvailable) return false;
    return storage.has(key);
  }, [storage, isAvailable]);

  const keys = useCallback((): string[] => {
    if (!isAvailable) return [];
    return storage.keys();
  }, [storage, isAvailable]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    keys,
    isAvailable
  };
}

// Hook for tutorial/onboarding state management
export function useTutorialState() {
  const { value: hasSeenTutorial, setValue: setHasSeenTutorial } = useLocalStorageBoolean('hasSeenTutorial', false);
  const { value: tutorialStep, setValue: setTutorialStep } = useLocalStorageNumber('tutorialStep', 0);
  const { value: completedSteps, setValue: setCompletedSteps } = useLocalStorageArray<string>('completedTutorialSteps', []);

  const markTutorialComplete = useCallback(() => {
    setHasSeenTutorial(true);
    setTutorialStep(0);
  }, [setHasSeenTutorial, setTutorialStep]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  }, [setCompletedSteps]);

  const resetTutorial = useCallback(() => {
    setHasSeenTutorial(false);
    setTutorialStep(0);
    setCompletedSteps([]);
  }, [setHasSeenTutorial, setTutorialStep, setCompletedSteps]);

  return {
    hasSeenTutorial,
    tutorialStep,
    completedSteps,
    setTutorialStep,
    markTutorialComplete,
    markStepComplete,
    resetTutorial
  };
}

// Hook for user preferences
export function useUserPreferences() {
  const { value: theme, setValue: setTheme } = useLocalStorageString('theme', 'system');
  const { value: language, setValue: setLanguage } = useLocalStorageString('language', 'ja');
  const { value: audioEnabled, setValue: setAudioEnabled } = useLocalStorageBoolean('audioEnabled', true);
  const { value: volume, setValue: setVolume } = useLocalStorageNumber('volume', 0.7);
  const { value: autoPlay, setValue: setAutoPlay } = useLocalStorageBoolean('autoPlay', false);
  const { value: showFurigana, setValue: setShowFurigana } = useLocalStorageBoolean('showFurigana', true);

  const resetPreferences = useCallback(() => {
    setTheme('system');
    setLanguage('ja');
    setAudioEnabled(true);
    setVolume(0.7);
    setAutoPlay(false);
    setShowFurigana(true);
  }, [setTheme, setLanguage, setAudioEnabled, setVolume, setAutoPlay, setShowFurigana]);

  return {
    theme,
    language,
    audioEnabled,
    volume,
    autoPlay,
    showFurigana,
    setTheme,
    setLanguage,
    setAudioEnabled,
    setVolume,
    setAutoPlay,
    setShowFurigana,
    resetPreferences
  };
}