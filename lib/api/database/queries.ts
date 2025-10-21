import { createClient as createBrowserClient } from '../supabase/client';

type SupabaseClient = ReturnType<typeof createBrowserClient>;

/**
 * Common database queries for the application
 */
export class DatabaseQueries {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient();
  }

  // Word queries
  async findWordsByCategory(category: string) {
    // エンコードされていないのでそのまま使用（Next.js設定でエンコードを避けているため）
    // まずカテゴリーIDを取得
    const { data: categoryData, error: categoryError } = await this.supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();
    
    if (categoryError || !categoryData) {
      throw new Error(`Category not found: ${category}`);
    }
    
    return this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          color,
          sort_order,
          is_active
        )
      `)
      .eq('category_id', categoryData.id)
      .eq('is_active', true)
      .order('word', { ascending: true });
  }

  async findWordById(wordId: string) {
    return this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          icon,
          color,
          sort_order,
          is_active
        )
      `)
      .eq('id', wordId)
      .eq('is_active', true)
      .single();
  }

  async searchWords(searchTerm: string, limit = 50) {
    return this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          icon,
          color,
          sort_order,
          is_active
        )
      `)
      .or(`word.ilike.%${searchTerm}%,japanese.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .limit(limit)
      .order('word', { ascending: true });
  }

  async getWordsByDifficulty(difficultyLevel: number) {
    return this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          icon,
          color,
          sort_order,
          is_active
        )
      `)
      .eq('difficulty_level', difficultyLevel)
      .eq('is_active', true)
      .order('word', { ascending: true });
  }

  // User progress queries
  async findUserProgressByCategory(userId: string, category: string) {
    return this.supabase
      .from('user_progress')
      .select(`
        *,
        words!inner(*)
      `)
      .eq('user_id', userId)
      .eq('words.category', category)
      .eq('words.is_active', true);
  }

  async findMasteredWords(userId: string, masteryThreshold = 0.8) {
    return this.supabase
      .from('user_progress')
      .select(`
        *,
        words(*)
      `)
      .eq('user_id', userId)
      .gte('mastery_level', masteryThreshold);
  }

  async findFavoriteWords(userId: string) {
    return this.supabase
      .from('user_progress')
      .select(`
        *,
        words(*)
      `)
      .eq('user_id', userId)
      .eq('is_favorite', true);
  }

  async findRecentlyStudiedWords(userId: string, days = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    return this.supabase
      .from('user_progress')
      .select(`
        *,
        words(*)
      `)
      .eq('user_id', userId)
      .gte('last_studied', dateThreshold.toISOString())
      .order('last_studied', { ascending: false });
  }

  // Review queries
  async findDueReviewWords(userId: string) {
    const now = new Date().toISOString();
    
    return this.supabase
      .from('review_words')
      .select(`
        *,
        words(*)
      `)
      .eq('user_id', userId)
      .or(`next_review.is.null,next_review.lte.${now}`)
      .order('next_review', { ascending: true });
  }

  async findReviewWordsByDifficulty(userId: string, difficultyLevel: number) {
    return this.supabase
      .from('review_words')
      .select(`
        *,
        words(*)
      `)
      .eq('user_id', userId)
      .eq('difficulty_level', difficultyLevel)
      .order('added_at', { ascending: false });
  }

  // Study session queries
  async findRecentStudySessions(userId: string, limit = 10) {
    return this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async findStudySessionsByCategory(userId: string, category: string) {
    return this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false });
  }

  async findStudySessionsByDateRange(userId: string, startDate: string, endDate: string) {
    return this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
  }

  // Learning records queries
  async findLearningRecordsByWord(userId: string, wordId: string) {
    return this.supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .order('studied_at', { ascending: false });
  }

  async findRecentLearningRecords(userId: string, limit = 100) {
    return this.supabase
      .from('learning_records')
      .select(`
        *,
        words(word, japanese, category)
      `)
      .eq('user_id', userId)
      .order('studied_at', { ascending: false })
      .limit(limit);
  }

  // Statistics queries
  async getStudyStatsByCategory(userId: string) {
    return this.supabase
      .from('user_progress')
      .select(`
        words!inner(category),
        study_count,
        correct_count,
        incorrect_count,
        mastery_level
      `)
      .eq('user_id', userId);
  }

  async getStudyStreakData(userId: string) {
    return this.supabase
      .from('study_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async getAccuracyByCategory(userId: string) {
    return this.supabase
      .from('learning_records')
      .select(`
        is_correct,
        words!inner(category)
      `)
      .eq('user_id', userId);
  }

  // Category queries
  async getCategoryStats() {
    return this.supabase
      .from('words')
      .select('category')
      .eq('is_active', true);
  }

  async getWordsCountByCategory() {
    return this.supabase
      .rpc('get_words_count_by_category');
  }

  // Audio queries
  async findAudioFilesByWord(wordId: string) {
    return this.supabase
      .from('audio_files')
      .select('*')
      .eq('word_id', wordId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  }

  // User profile queries
  async findUserProfileByUserId(userId: string) {
    return this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  // Contact inquiries queries
  async findContactInquiriesByStatus(status: string) {
    return this.supabase
      .from('contact_inquiries')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
  }

  async findContactInquiriesByCategory(category: string) {
    return this.supabase
      .from('contact_inquiries')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
  }
}

// Export a default instance
export const dbQueries = new DatabaseQueries();