// API-related types

// Quiz and learning types
export interface QuizQuestion {
  word: import('./database').Word;
  options: string[];
  correct_answer: string;
  type: 'meaning' | 'example' | 'japanese_to_english';
  question?: string; // 問題文（例文問題の場合）
}

// Statistics and analytics types
export interface AppStats {
  total_words: number;
  studied_words: number;
  mastered_words: number;
  study_time_minutes: number;
  review_count: number;
  total_words_studied: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  current_streak: number;
  longest_streak: number;
  total_study_sessions: number;
  average_accuracy: number;
  words_mastered: number;
  favorite_words_count: number;
}

// Learning records
export interface LearningRecordSnapshot {
  studyMinutes: number;
  completedCount: number;
  correctCount: number;
  accuracy: number; // 0-100
}

export interface LearningRecordDay extends LearningRecordSnapshot {
  date: string; // YYYY-MM-DD
  displayDate: string; // locale short format
}

export interface LearningRecord {
  daily: LearningRecordDay[];
  summary: {
    today: LearningRecordSnapshot;
    last7Days: LearningRecordSnapshot;
    last30Days: LearningRecordSnapshot;
    lifetime: LearningRecordSnapshot;
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Request types
export interface StudySessionRequest {
  category: string;
  mode: string;
  total_words: number;
}

export interface ProgressUpdateRequest {
  word_id: string;
  is_correct: boolean;
  response_time_ms?: number;
  mastery_level?: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

// Filter and search types
export type StudyMode = 'flashcard' | 'quiz';
export type MasteryFilter = 'all' | 'new' | 'studying' | 'mastered';
export type TriviaFilter = 'all' | 'unread' | 'bookmarked' | 'featured';
export type TriviaDifficulty = 1 | 2 | 3;

export interface SearchFilters {
  category?: string;
  mastery?: MasteryFilter;
  favorite?: boolean;
  difficulty?: TriviaDifficulty;
  tags?: string[];
}

export interface SortOptions {
  field: 'word' | 'japanese' | 'created_at' | 'study_count' | 'mastery_level';
  direction: 'asc' | 'desc';
}