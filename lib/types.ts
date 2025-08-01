import type { Json } from './database.types';

export interface UserProfile {
  id: string;
  user_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  study_goal: number | null;
  preferred_language: string | null;
  timezone: string | null;
  notification_settings: Json | null;
  study_streak: number | null;
  last_study_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Word {
  id: string;
  category: string;
  word: string;
  japanese: string;
  example1: string;
  example2: string;
  example3: string | null;
  example1_jp: string;
  example2_jp: string;
  example3_jp: string | null;
  audio_file: string | null;
  audio_file_id: string | null;
  phonetic: string | null;
  category_id: string | null;
  created_by: string | null;
  difficulty_level: number | null;
  is_active: boolean | null;
  tags: string[] | null;
  trivia_content: string | null;
  trivia_content_jp: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string | null;
  word_id: string | null;
  mastery_level: number | null;
  study_count: number | null;
  correct_count: number | null;
  incorrect_count: number | null;
  last_studied: string | null;
  is_favorite: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StudySession {
  id: string;
  user_id: string | null;
  category: string;
  mode: string;
  total_words: number;
  completed_words: number;
  correct_answers: number;
  start_time: string;
  end_time: string | null;
  created_at: string | null;
}

export interface ReviewWord {
  id: string;
  user_id: string | null;
  word_id: string | null;
  added_at: string | null;
  review_count: number | null;
  last_reviewed: string | null;
  next_review: string | null;
  difficulty_level: number | null;
}

export interface ReviewSession {
  id: string;
  user_id: string | null;
  total_words: number;
  completed_words: number;
  correct_answers: number;
  start_time: string;
  end_time: string | null;
  created_at: string | null;
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
  question?: string; // 問題文（例文問題の場合）
}

export interface AppStats {
  total_words: number;
  studied_words: number;
  mastered_words: number;
  study_time_minutes: number;
  review_count: number;
}

export interface Trivia {
  id: string;
  word_id?: string;
  category: string;
  title: string;
  content: string;
  content_jp: string;
  difficulty_level: number; // 1-3の値
  tags?: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserTriviaProgress {
  id: string;
  user_id: string;
  trivia_id: string;
  is_read: boolean;
  is_bookmarked: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export type StudyMode = 'flashcard' | 'quiz';
export type MasteryFilter = 'all' | 'new' | 'studying' | 'mastered';
export type TriviaFilter = 'all' | 'unread' | 'bookmarked' | 'featured';
export type TriviaDifficulty = 1 | 2 | 3; 