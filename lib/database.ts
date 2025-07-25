import { createClient } from './supabase/client';
import { Word, UserProgress, StudySession, ReviewWord, ReviewSession, AppStats, UserProfile } from './types';

export class DatabaseService {
  private supabase = createClient();

  // 単語関連
  async getWords(): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getWordsByCategory(category: string): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('category', category)
      .order('word', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('category')
      .order('category', { ascending: true });

    if (error) throw error;

    const categoryCounts = data?.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts || {}).map(([category, count]) => ({
      category,
      count
    }));
  }

  // ユーザープログレス関連
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async getWordProgress(userId: string, wordId: string): Promise<UserProgress | null> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async upsertProgress(progress: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('user_progress')
      .upsert({
        ...progress,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async updateProgress(userId: string, wordId: string, updates: Partial<UserProgress>): Promise<void> {
    const { error } = await this.supabase
      .from('user_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  // 学習セッション関連
  async createStudySession(session: Omit<StudySession, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateStudySession(sessionId: string, updates: Partial<StudySession>): Promise<void> {
    const { error } = await this.supabase
      .from('study_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 復習リスト関連
  async getReviewWords(userId: string): Promise<ReviewWord[]> {
    const { data, error } = await this.supabase
      .from('review_words')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDueReviewWords(userId: string): Promise<ReviewWord[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('review_words')
      .select('*')
      .eq('user_id', userId)
      .or(`next_review.is.null,next_review.lte.${now}`)
      .order('next_review', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addToReview(userId: string, wordId: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .insert({
        user_id: userId,
        word_id: wordId,
        added_at: new Date().toISOString(),
        review_count: 0,
        difficulty_level: 3
      });

    if (error) throw error;
  }

  async updateReviewWord(userId: string, wordId: string, updates: Partial<ReviewWord>): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .update(updates)
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  async removeFromReview(userId: string, wordId: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  // 復習セッション関連
  async createReviewSession(session: Omit<ReviewSession, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('review_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateReviewSession(sessionId: string, updates: Partial<ReviewSession>): Promise<void> {
    const { error } = await this.supabase
      .from('review_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 復習スケジューリング（間隔反復アルゴリズム）
  calculateNextReview(difficultyLevel: number, reviewCount: number): Date {
    const now = new Date();
    let intervalDays: number;

    // 間隔反復アルゴリズム（SuperMemo 2の簡略版）
    switch (difficultyLevel) {
      case 1: // 非常に難しい
        intervalDays = Math.max(1, Math.floor(reviewCount * 0.5));
        break;
      case 2: // 難しい
        intervalDays = Math.max(1, Math.floor(reviewCount * 0.8));
        break;
      case 3: // 普通
        intervalDays = Math.max(1, reviewCount);
        break;
      case 4: // 簡単
        intervalDays = Math.max(1, Math.floor(reviewCount * 1.5));
        break;
      case 5: // 非常に簡単
        intervalDays = Math.max(1, Math.floor(reviewCount * 2));
        break;
      default:
        intervalDays = 1;
    }

    // 初回復習の場合は翌日
    if (reviewCount === 0) {
      intervalDays = 1;
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + intervalDays);
    return nextReview;
  }

  // 統計情報
  async getAppStats(userId: string): Promise<AppStats> {
    const [words, progress, reviewWords] = await Promise.all([
      this.getWords(),
      this.getUserProgress(userId),
      this.getReviewWords(userId)
    ]);

    const totalWords = words.length;
    const studiedWords = progress.length;
    const masteredWords = progress.filter(p => (p.mastery_level || 0) >= 0.8).length;
    const studyTimeMinutes = progress.reduce((total, p) => total + ((p.study_count || 0) * 2), 0); // 仮の計算
    const reviewCount = reviewWords.length;

    return {
      total_words: totalWords,
      studied_words: studiedWords,
      mastered_words: masteredWords,
      study_time_minutes: studyTimeMinutes,
      review_count: reviewCount
    };
  }

  // プロフィール関連
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data || null;
  }

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 