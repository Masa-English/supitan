'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserStore } from '@/lib/stores/user-store';
import { useDataStore } from '@/lib/stores/data-store';
import { useAudioStore } from '@/lib/stores/audio-store';
import type { Word, UserProgress, QuizQuestion } from '@/lib/types';

interface UseLearningOptions {
  category?: string;
  mode: 'flashcard' | 'quiz' | 'review';
  autoPlay?: boolean;
  shuffleWords?: boolean;
}

interface UseLearningReturn {
  // データ
  words: Word[];
  currentWord: Word | null;
  currentIndex: number;
  totalWords: number;
  
  // 進捗
  progress: Record<string, UserProgress>;
  completedWords: string[];
  reviewWords: string[];
  
  // 状態
  loading: boolean;
  error: string | null;
  isComplete: boolean;
  
  // クイズ専用
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  
  // アクション
  nextWord: () => void;
  previousWord: () => void;
  goToWord: (index: number) => void;
  markAsCorrect: (wordId: string) => Promise<void>;
  markAsIncorrect: (wordId: string) => Promise<void>;
  addToReview: (wordId: string) => Promise<void>;
  removeFromReview: (wordId: string) => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  playWordAudio: (wordId?: string) => void;
  reset: () => void;
  
  // クイズ専用アクション
  answerQuestion: (answer: string) => Promise<boolean>;
  generateQuestions: () => void;
}

export function useLearning(options: UseLearningOptions): UseLearningReturn {
  const { category, mode, autoPlay = false, shuffleWords = false } = options;
  
  // Store hooks
  const { user, userProgress, updateWordProgress, toggleFavorite: toggleUserFavorite } = useUserStore();
  const { words: allWords, getWordsByCategory, wordsLoading: dataLoading, wordsError: dataError } = useDataStore();
  const { playWordAudio: playAudio, playCorrectSound, playIncorrectSound } = useAudioStore();
  
  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [reviewWords, setReviewWords] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get words based on mode and category
  const words = useMemo(() => {
    let filteredWords: Word[] = [];
    
    if (mode === 'review') {
      // For review mode, we would need to get review words from the data store
      // For now, return empty array as review mode needs special handling
      filteredWords = [];
    } else if (category) {
      filteredWords = allWords.filter(word => word.category === category);
    } else {
      filteredWords = allWords;
    }
    
    // Shuffle if requested
    if (shuffleWords) {
      const randomValue = Math.random();
      console.log('[useLearning] Shuffling words, Math.random() value:', randomValue);
      filteredWords = [...filteredWords].sort(() => randomValue - 0.5);
      console.log('[useLearning] Shuffled words count:', filteredWords.length);
    }
    
    return filteredWords;
  }, [allWords, category, mode, shuffleWords]);

  // Current word
  const currentWord = useMemo(() => {
    return words[currentIndex] || null;
  }, [words, currentIndex]);

  // Current question for quiz mode
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  // Check if learning session is complete
  const isComplete = useMemo(() => {
    return currentIndex >= words.length && words.length > 0;
  }, [currentIndex, words.length]);

  // Generate quiz questions
  const generateQuestions = useCallback(() => {
    if (mode !== 'quiz' || words.length === 0) return;
    
    const newQuestions: QuizQuestion[] = [];
    
    words.forEach(word => {
      // Generate Japanese to English question
      const otherWords = words.filter(w => w.id !== word.id);
      const randomValue1 = Math.random();
      console.log('[useLearning] Generating quiz options for word:', word.word, 'Math.random() value:', randomValue1);
      const wrongOptions = otherWords
        .sort(() => randomValue1 - 0.5)
        .slice(0, 3)
        .map(w => w.word);
      
      const randomValue2 = Math.random();
      console.log('[useLearning] Shuffling all options for word:', word.word, 'Math.random() value:', randomValue2);
      const allOptions = [word.word, ...wrongOptions].sort(() => randomValue2 - 0.5);
      
      newQuestions.push({
        word,
        question: word.japanese,
        correct_answer: word.word,
        options: allOptions,
        type: 'japanese_to_english'
      });
      
      // Generate English to Japanese question
      const wrongJapaneseOptions = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.japanese);
      
      const allJapaneseOptions = [word.japanese, ...wrongJapaneseOptions].sort(() => Math.random() - 0.5);
      
      newQuestions.push({
        word,
        question: word.word,
        correct_answer: word.japanese,
        options: allJapaneseOptions,
        type: 'japanese_to_english' // Note: keeping the same type as the interface only supports this
      });
    });
    
    // Shuffle questions
    const randomValue3 = Math.random();
    console.log('[useLearning] Shuffling questions, Math.random() value:', randomValue3, 'questions count:', newQuestions.length);
    const shuffledQuestions = newQuestions.sort(() => randomValue3 - 0.5);
    setQuestions(shuffledQuestions);
  }, [words, mode]);

  // Navigation functions
  const nextWord = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      
      // Auto-play audio if enabled
      if (autoPlay && words[currentIndex + 1]) {
        setTimeout(() => playAudio(words[currentIndex + 1].id), 300);
      }
    }
  }, [currentIndex, autoPlay, playAudio, words]);

  const previousWord = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      
      // Auto-play audio if enabled
      if (autoPlay && words[currentIndex - 1]) {
        setTimeout(() => playAudio(words[currentIndex - 1].id), 300);
      }
    }
  }, [currentIndex, autoPlay, playAudio, words]);

  const goToWord = useCallback((index: number) => {
    if (index >= 0 && index < words.length) {
      setCurrentIndex(index);
      
      // Auto-play audio if enabled
      if (autoPlay && words[index]) {
        setTimeout(() => playAudio(words[index].id), 300);
      }
    }
  }, [autoPlay, playAudio, words]);

  // Progress tracking functions
  const markAsCorrect = useCallback(async (wordId: string) => {
    if (!user) return;
    
    try {
      await updateWordProgress(wordId, {
        correct_count: (userProgress[wordId]?.correct_count || 0) + 1,
        last_studied: new Date().toISOString()
      });
      
      setCompletedWords(prev => [...prev, wordId]);
      await playCorrectSound();
    } catch (error) {
      console.error('Failed to mark word as correct:', error);
    }
  }, [user, userProgress, updateWordProgress, playCorrectSound]);

  const markAsIncorrect = useCallback(async (wordId: string) => {
    if (!user) return;
    
    try {
      await updateWordProgress(wordId, {
        incorrect_count: (userProgress[wordId]?.incorrect_count || 0) + 1,
        last_studied: new Date().toISOString()
      });
      
      await playIncorrectSound();
    } catch (error) {
      console.error('Failed to mark word as incorrect:', error);
    }
  }, [user, userProgress, updateWordProgress, playIncorrectSound]);

  const addToReview = useCallback(async (wordId: string) => {
    if (!user) return;
    
    try {
      // This would need to add to the review_words table
      // For now, just track locally
      setReviewWords(prev => [...prev, wordId]);
    } catch (error) {
      console.error('Failed to add word to review:', error);
    }
  }, [user]);

  const removeFromReview = useCallback(async (wordId: string) => {
    if (!user) return;
    
    try {
      // This would need to remove from the review_words table
      // For now, just track locally
      setReviewWords(prev => prev.filter(id => id !== wordId));
    } catch (error) {
      console.error('Failed to remove word from review:', error);
    }
  }, [user]);

  const toggleFavorite = useCallback(async (wordId: string) => {
    if (!user) return;
    
    try {
      await toggleUserFavorite(wordId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [user, toggleUserFavorite]);

  const playWordAudio = useCallback((wordId?: string) => {
    const targetWordId = wordId || currentWord?.id;
    if (targetWordId) {
      playAudio(targetWordId);
    }
  }, [currentWord?.id, playAudio]);

  // Quiz-specific function
  const answerQuestion = useCallback(async (answer: string): Promise<boolean> => {
    if (!currentQuestion || !user) return false;
    
    const isCorrect = answer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      await markAsCorrect(currentQuestion.word.id);
    } else {
      await markAsIncorrect(currentQuestion.word.id);
    }
    
    return isCorrect;
  }, [currentQuestion, user, markAsCorrect, markAsIncorrect]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setCompletedWords([]);
    setReviewWords([]);
    setQuestions([]);
    setError(null);
  }, []);

  // Initialize questions for quiz mode
  useEffect(() => {
    if (mode === 'quiz' && words.length > 0) {
      generateQuestions();
    }
  }, [mode, words, generateQuestions]);

  // Load words when category changes
  useEffect(() => {
    if (category && mode !== 'review') {
      getWordsByCategory(category);
    }
  }, [category, mode, getWordsByCategory]);

  return {
    // Data
    words,
    currentWord,
    currentIndex,
    totalWords: words.length,
    
    // Progress
    progress: userProgress,
    completedWords,
    reviewWords,
    
    // State
    loading: dataLoading,
    error: dataError || error,
    isComplete,
    
    // Quiz specific
    questions,
    currentQuestion,
    
    // Actions
    nextWord,
    previousWord,
    goToWord,
    markAsCorrect,
    markAsIncorrect,
    addToReview,
    removeFromReview,
    toggleFavorite,
    playWordAudio,
    reset,
    
    // Quiz specific actions
    answerQuestion,
    generateQuestions
  };
}