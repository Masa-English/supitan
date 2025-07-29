'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (open: boolean) => void;
  toggleSideMenu: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  return (
    <HeaderContext.Provider value={{
      isSideMenuOpen,
      setIsSideMenuOpen,
      toggleSideMenu
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    // コンテキストが利用できない場合はデフォルト値を返す
    return {
      isSideMenuOpen: false,
      setIsSideMenuOpen: () => {},
      toggleSideMenu: () => {}
    };
  }
  return context;
} 