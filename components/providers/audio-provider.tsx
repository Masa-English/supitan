'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // 音声合成APIの初期化
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // 音声の事前読み込み
      const utterance = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(utterance);
      speechSynthesis.cancel();
      
      setIsInitialized(true);
    }
  }, []);
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">音声機能を初期化中...</span>
      </div>
    );
  }
  
  return <>{children}</>;
}