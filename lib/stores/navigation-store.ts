'use client';

import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  start: () => void;
  stop: () => void;
}

interface LearningSessionState {
  // 学習セッション情報
  category: string | null;
  currentSection: string | null;
  sections: string[];
  learningMode: 'flashcard' | 'quiz' | null;
  
  // 次のセクションが存在するかチェック
  hasNextSection: boolean;
  
  // セッション管理
  setLearningSession: (params: {
    category: string;
    currentSection: string;
    sections: string[];
    learningMode: 'flashcard' | 'quiz';
  }) => void;
  
  // 次のセクション情報を取得
  getNextSection: () => string | null;
  
  // セッションクリア
  clearSession: () => void;
  
  // セッション情報の更新
  updateCurrentSection: (section: string) => void;
}

// ナビゲーション状態管理
export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  start: () => set({ isNavigating: true }),
  stop: () => set({ isNavigating: false }),
}));

// 学習セッション状態管理
export const useLearningSessionStore = create<LearningSessionState>((set, get) => ({
  category: null,
  currentSection: null,
  sections: [],
  learningMode: null,
  hasNextSection: false,
  
  setLearningSession: ({ category, currentSection, sections, learningMode }) => {
    const sortedSections = sections.sort();
    const currentIndex = sortedSections.indexOf(currentSection);
    const hasNextSection = currentIndex !== -1 && currentIndex < sortedSections.length - 1;
    
    set({
      category,
      currentSection,
      sections: sortedSections,
      learningMode,
      hasNextSection,
    });
  },
  
  getNextSection: () => {
    const { currentSection, sections } = get();
    
    if (!currentSection || sections.length === 0) {
      return null;
    }
    
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex === -1 || currentIndex >= sections.length - 1) {
      return null; // 最後のセクションまたは見つからない場合
    }
    
    return sections[currentIndex + 1];
  },
  
  clearSession: () => {
    set({
      category: null,
      currentSection: null,
      sections: [],
      learningMode: null,
      hasNextSection: false,
    });
  },
  
  updateCurrentSection: (section: string) => {
    const { sections } = get();
    const currentIndex = sections.indexOf(section);
    const hasNextSection = currentIndex !== -1 && currentIndex < sections.length - 1;
    
    set({ 
      currentSection: section,
      hasNextSection,
    });
  },
}));
