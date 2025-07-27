'use client';

import { useState, useEffect } from 'react';
import { TutorialModal } from './tutorial-modal';

interface TutorialWrapperProps {
  children: React.ReactNode;
}

export function TutorialWrapper({ children }: TutorialWrapperProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // 初回訪問時のみチュートリアルを表示
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // チュートリアル完了をlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };

  return (
    <>
      {children}
      
      {/* チュートリアルモーダル */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </>
  );
} 