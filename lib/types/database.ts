// Database-related types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database types (placeholder - replace with actual Supabase generated types when available)
export interface Database {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database["public"]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

// Core entity types that map to database tables
export interface User {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

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
  section?: number | string | null;
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
  difficulty_level: number | null; // TODO: 削除予定 - 難易度機能は廃止
  is_active: boolean | null;
  tags: string[] | null;
  trivia_content: string | null;
  trivia_content_jp: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_favorite?: boolean;
  mastery_level?: number | null;
  study_count?: number | null;
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

export interface ReviewWord extends Word {
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
  category: string;
  count: number;
  englishName: string;
  pos: string;
  description: string;
  color: string;
  icon: string;
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