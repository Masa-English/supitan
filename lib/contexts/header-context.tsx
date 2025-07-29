'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderContextType {
  title: string;
  setTitle: (title: string) => void;
  showProgress: boolean;
  setShowProgress: (show: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalCount: number;
  setTotalCount: (count: number) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('ダッシュボード');
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const value: HeaderContextType = {
    title,
    setTitle,
    showProgress,
    setShowProgress,
    progress,
    setProgress,
    currentIndex,
    setCurrentIndex,
    totalCount,
    setTotalCount,
  };

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    // コンテキストが利用できない場合はデフォルト値を返す
    return {
      title: 'ダッシュボード',
      setTitle: () => {},
      showProgress: false,
      setShowProgress: () => {},
      progress: 0,
      setProgress: () => {},
      currentIndex: 0,
      setCurrentIndex: () => {},
      totalCount: 0,
      setTotalCount: () => {},
    };
  }
  return context;
} 