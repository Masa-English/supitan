export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  study_goal: number;
  preferred_language: 'ja' | 'en';
  timezone: string;
  notification_settings: {
    daily_reminder: boolean;
    achievement: boolean;
    review_reminder: boolean;
  };
  study_streak: number;
  last_study_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  category: string;
  word: string;
  japanese: string;
  example1: string;
  example2: string;
  example3?: string;
  example1_jp: string;
  example2_jp: string;
  example3_jp?: string;
  audio_file?: string;
  phonetic?: string;
  created_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  word_id: string;
  mastery_level: number; // 0-1の値
  study_count: number;
  correct_count: number;
  incorrect_count: number;
  last_studied: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  category: string;
  mode: 'flashcard' | 'quiz';
  total_words: number;
  completed_words: number;
  correct_answers: number;
  start_time: string;
  end_time?: string;
  created_at: string;
}

export interface ReviewWord {
  id: string;
  user_id: string;
  word_id: string;
  added_at: string;
  review_count: number;
  last_reviewed?: string;
  next_review?: string;
  difficulty_level: number; // 1-5の値
}

export interface ReviewSession {
  id: string;
  user_id: string;
  total_words: number;
  completed_words: number;
  correct_answers: number;
  start_time: string;
  end_time?: string;
  created_at: string;
}

export interface Category {
  name: string;
  count: number;
  pos: string;
}

export interface QuizQuestion {
  word: Word;
  options: string[];
  correct_answer: string;
  type: 'meaning' | 'example';
}

export interface AppStats {
  total_words: number;
  studied_words: number;
  mastered_words: number;
  study_time_minutes: number;
  review_count: number;
}

export type StudyMode = 'flashcard' | 'quiz';
export type MasteryFilter = 'all' | 'new' | 'studying' | 'mastered'; 