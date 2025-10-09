export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          reason: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          reason: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          reason?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audio_files: {
        Row: {
          audio_type: string
          created_at: string | null
          duration_seconds: number | null
          file_index: number
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_active: boolean | null
          mime_type: string
          updated_at: string | null
          uploaded_by: string | null
          word_id: string | null
        }
        Insert: {
          audio_type: string
          created_at?: string | null
          duration_seconds?: number | null
          file_index: number
          file_name: string
          file_path: string
          file_size: number
          id?: string
          is_active?: boolean | null
          mime_type: string
          updated_at?: string | null
          uploaded_by?: string | null
          word_id?: string | null
        }
        Update: {
          audio_type?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_index?: number
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_active?: boolean | null
          mime_type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      chunk_english_data: {
        Row: {
          chunk_text: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          chunk_text: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          chunk_text?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          email: string
          id: string
          ip_address: unknown | null
          message: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          message: string
          name: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          message?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      review_sessions: {
        Row: {
          completed_words: number
          correct_answers: number
          created_at: string | null
          end_time: string | null
          id: string
          start_time: string
          total_words: number
          user_id: string | null
        }
        Insert: {
          completed_words: number
          correct_answers: number
          created_at?: string | null
          end_time?: string | null
          id?: string
          start_time: string
          total_words: number
          user_id?: string | null
        }
        Update: {
          completed_words?: number
          correct_answers?: number
          created_at?: string | null
          end_time?: string | null
          id?: string
          start_time?: string
          total_words?: number
          user_id?: string | null
        }
        Relationships: []
      }
      review_words: {
        Row: {
          added_at: string | null
          difficulty_level: number | null
          id: string
          last_reviewed: string | null
          next_review: string | null
          review_count: number | null
          user_id: string | null
          word_id: string | null
        }
        Insert: {
          added_at?: string | null
          difficulty_level?: number | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number | null
          user_id?: string | null
          word_id?: string | null
        }
        Update: {
          added_at?: string | null
          difficulty_level?: number | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number | null
          user_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          category: string
          completed_words: number
          correct_answers: number
          created_at: string | null
          end_time: string | null
          id: string
          mode: string
          start_time: string
          total_words: number
          user_id: string | null
        }
        Insert: {
          category: string
          completed_words: number
          correct_answers: number
          created_at?: string | null
          end_time?: string | null
          id?: string
          mode: string
          start_time: string
          total_words: number
          user_id?: string | null
        }
        Update: {
          category?: string
          completed_words?: number
          correct_answers?: number
          created_at?: string | null
          end_time?: string | null
          id?: string
          mode?: string
          start_time?: string
          total_words?: number
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia: {
        Row: {
          category: string
          correct_answer: string
          created_at: string | null
          difficulty_level: number | null
          explanation: string | null
          id: string
          is_featured: boolean | null
          question: string
          updated_at: string | null
          word_id: string | null
          wrong_answers: string[]
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string | null
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          is_featured?: boolean | null
          question: string
          updated_at?: string | null
          word_id?: string | null
          wrong_answers: string[]
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string | null
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          is_featured?: boolean | null
          question?: string
          updated_at?: string | null
          word_id?: string | null
          wrong_answers?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "trivia_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_study_date: string | null
          notification_settings: Json | null
          preferred_language: string | null
          study_goal: number | null
          study_streak: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_study_date?: string | null
          notification_settings?: Json | null
          preferred_language?: string | null
          study_goal?: number | null
          study_streak?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_study_date?: string | null
          notification_settings?: Json | null
          preferred_language?: string | null
          study_goal?: number | null
          study_streak?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          correct_count: number | null
          created_at: string | null
          id: string
          incorrect_count: number | null
          is_favorite: boolean | null
          last_studied: string | null
          mastery_level: number | null
          study_count: number | null
          updated_at: string | null
          user_id: string | null
          word_id: string | null
        }
        Insert: {
          correct_count?: number | null
          created_at?: string | null
          id?: string
          incorrect_count?: number | null
          is_favorite?: boolean | null
          last_studied?: string | null
          mastery_level?: number | null
          study_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          word_id?: string | null
        }
        Update: {
          correct_count?: number | null
          created_at?: string | null
          id?: string
          incorrect_count?: number | null
          is_favorite?: boolean | null
          last_studied?: string | null
          mastery_level?: number | null
          study_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trivia_progress: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          is_bookmarked: boolean | null
          is_correct: boolean
          trivia_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_correct: boolean
          trivia_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          is_correct?: boolean
          trivia_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_trivia_progress_trivia_id_fkey"
            columns: ["trivia_id"]
            isOneToOne: false
            referencedRelation: "trivia"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          audio_file: string | null
          category: string
          category_id: string | null
          created_at: string | null
          example1: string
          example1_jp: string
          example2: string | null
          example2_jp: string | null
          example3: string | null
          example3_jp: string | null
          id: string
          is_active: boolean | null
          japanese: string
          phonetic: string | null
          section: string
          trivia_content_jp: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          audio_file?: string | null
          category: string
          category_id?: string | null
          created_at?: string | null
          example1: string
          example1_jp: string
          example2?: string | null
          example2_jp?: string | null
          example3?: string | null
          example3_jp?: string | null
          id?: string
          is_active?: boolean | null
          japanese: string
          phonetic?: string | null
          section?: string
          trivia_content_jp?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          audio_file?: string | null
          category?: string
          category_id?: string | null
          created_at?: string | null
          example1?: string
          example1_jp?: string
          example2?: string | null
          example2_jp?: string | null
          example3?: string | null
          example3_jp?: string | null
          id?: string
          is_active?: boolean | null
          japanese?: string
          phonetic?: string | null
          section?: string
          trivia_content_jp?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contact_inquiries_summary: {
        Row: {
          category: string | null
          count: number | null
          last_24h: number | null
          last_30d: number | null
          last_7d: number | null
          priority: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: { p_action: string; p_record_id?: string; p_table_name?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Export commonly used table types
export type Word = Database['public']['Tables']['words']['Row']
export type WordInsert = Database['public']['Tables']['words']['Insert']
export type WordUpdate = Database['public']['Tables']['words']['Update']

export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert']
export type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// カテゴリー統計情報を含む型（動的生成用）
export type CategoryWithStats = {
  category: string;
  count: number;
  englishName: string;
  pos: string;
  description: string;
  color: string;
  icon: string;
}

// User型はSupabaseのauth.usersから取得するため、ここでは定義しない
// export type User = Database['public']['Tables']['users']['Row']
// export type UserInsert = Database['public']['Tables']['users']['Insert']
// export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type ReviewWord = Database['public']['Tables']['review_words']['Row']
export type ReviewWordInsert = Database['public']['Tables']['review_words']['Insert']
export type ReviewWordUpdate = Database['public']['Tables']['review_words']['Update']

// 復習単語とWord情報を結合した型
export type ReviewWordWithWord = ReviewWord & {
  word: Word;
}

export const Constants = {
  public: {
    Enums: {},
  },
} as const
