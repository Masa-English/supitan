'use client';

import { useState, useEffect } from 'react';
import { TutorialModal } from './tutorial-modal';
import { useTutorialState } from '@/lib/hooks';

interface TutorialWrapperProps {
  children: React.ReactNode;
}

export function TutorialWrapper({ children }: TutorialWrapperProps) {
  const { hasSeenTutorial, markTutorialComplete } = useTutorialState();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // 初回訪問時のみチュートリアルを表示
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [hasSeenTutorial]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    markTutorialComplete();
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