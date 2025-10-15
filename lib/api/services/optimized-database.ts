/**
 * 最適化されたデータベースサービス
 * クエリの統合とキャッシュ戦略を改善
 */

import { createClient as createBrowserClient } from '../supabase/client';
import { createServiceClient } from '../supabase/service';
import { Word, UserProgress, ReviewWord } from '@/lib/types';

export class OptimizedDatabaseService {
  private supabase = this.getSupabaseClient();
  private queryCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  private getSupabaseClient() {
    // ビルド時やサーバーサイドではサービスロールクライアントを使用
    if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        return createServiceClient();
      } catch (error) {
        console.warn('Failed to create service client, falling back to browser client:', error);
        return createBrowserClient();
      }
    }
    return createBrowserClient();
  }

  /**
   * キャッシュからデータを取得
   */
  private getCached<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * データをキャッシュに保存
   */
  private setCache<T>(key: string, data: T, ttl: number = 300000): void { // 5分デフォルト
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * キャッシュをクリア
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.queryCache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.queryCache.keys()) {
      if (regex.test(key)) {
        this.queryCache.delete(key);
      }
    }
  }

  // ============================================================================
  // 最適化された単語関連クエリ
  // ============================================================================

  /**
   * カテゴリー別単語を効率的に取得（JOINを使用）
   */
  async getWordsByCategoryOptimized(category: string): Promise<Word[]> {
    const cacheKey = `words_category_${category}`;
    const cached = this.getCached<Word[]>(cacheKey);
    if (cached) return cached;

    try {
      // URLデコードを確実に実行
      const decodedCategory = decodeURIComponent(category);
      console.log(`OptimizedDatabase: Searching for category: "${decodedCategory}"`);

      // 単一クエリでカテゴリーと単語を同時取得（JOIN使用）
      const { data, error } = await this.supabase
        .from('words')
        .select(`
          *,
          categories!inner (
            id,
            name,
            description,
            color,
            sort_order,
            is_active
          )
        `)
        .eq('categories.name', decodedCategory)
        .eq('categories.is_active', true)
        .order('word', { ascending: true });

      if (error) {
        console.error(`Database error for category "${decodedCategory}":`, error);
        throw error;
      }

      const words = data || [];
      console.log(`OptimizedDatabase: Found ${words.length} words for category "${decodedCategory}"`);

      // キャッシュに保存（10分間）
      this.setCache(cacheKey, words, 600000);
      return words;
    } catch (error) {
      console.error(`Failed to fetch words for category "${category}":`, error);
      throw error;
    }
  }

  /**
   * 全単語を効率的に取得
   */
  async getAllWordsOptimized(): Promise<Word[]> {
    const cacheKey = 'all_words';
    const cached = this.getCached<Word[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
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
        .order('word', { ascending: true });

      if (error) throw error;

      const words = data || [];
      // キャッシュに保存（30分間）
      this.setCache(cacheKey, words, 1800000);
      return words;
    } catch (error) {
      console.error('Failed to fetch all words:', error);
      throw error;
    }
  }

  /**
   * カテゴリー一覧を効率的に取得（単語数も同時取得）
   */
  async getCategoriesOptimized(): Promise<{ category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]> {
    const cacheKey = 'categories_with_counts';
    const cached = this.getCached<{ category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]>(cacheKey);
    if (cached) return cached;

    try {
      // 単一クエリでカテゴリーと単語数を同時取得
      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          *,
          words!left(count)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Database error getting categories:', error);
        throw error;
      }

      const categories = (data || []).map(cat => ({
        category: cat.name,
        count: cat.words?.[0]?.count || 0,
        englishName: cat.english_name || cat.name,
        pos: cat.pos || '',
        description: cat.description || '',
        color: cat.color || '#3b82f6',
        icon: cat.icon || 'book',
      }));

      // キャッシュに保存（1時間）
      this.setCache(cacheKey, categories, 3600000);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // ============================================================================
  // 最適化されたユーザー進捗関連クエリ
  // ============================================================================

  /**
   * ユーザー進捗を効率的に取得
   */
  async getUserProgressOptimized(userId: string): Promise<UserProgress[]> {
    const cacheKey = `user_progress_${userId}`;
    const cached = this.getCached<UserProgress[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const progress = data || [];
      // キャッシュに保存（5分間）
      this.setCache(cacheKey, progress, 300000);
      return progress;
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      throw error;
    }
  }

  /**
   * 復習対象単語を効率的に取得
   */
  async getDueReviewWordsOptimized(userId: string): Promise<ReviewWord[]> {
    const cacheKey = `review_words_${userId}`;
    const cached = this.getCached<ReviewWord[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await this.supabase
        .from('review_words')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const reviewWords = (data || []) as ReviewWord[];

      // キャッシュに保存（2分間）
      this.setCache(cacheKey, reviewWords, 120000);
      return reviewWords;
    } catch (error) {
      console.error('Failed to fetch review words:', error);
      throw error;
    }
  }

  // ============================================================================
  // 統合データ取得（複数テーブルを効率的に結合）
  // ============================================================================

  /**
   * ページに必要な全データを効率的に取得
   */
  async getPageDataOptimized(params: {
    type: 'category' | 'quiz' | 'flashcard' | 'review';
    category?: string;
    userId?: string;
  }): Promise<{
    words: Word[];
    userProgress?: UserProgress[];
    categories?: { category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[];
    reviewWords?: ReviewWord[];
  }> {
    const { type, category, userId } = params;
    const cacheKey = `page_data_${type}_${category || 'all'}_${userId || 'anonymous'}`;
    const cached = this.getCached<{ words: Word[]; userProgress?: UserProgress[]; categories?: { category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]; reviewWords?: ReviewWord[] }>(cacheKey);
    if (cached) return cached;

    try {
      const promises: Promise<unknown>[] = [];

      // 単語データの取得
      if (type === 'category' || type === 'quiz' || type === 'flashcard') {
        if (category) {
          promises.push(this.getWordsByCategoryOptimized(category));
        } else {
          promises.push(this.getAllWordsOptimized());
        }
      } else if (type === 'review') {
        promises.push(this.getAllWordsOptimized());
      }

      // カテゴリーデータの取得
      if (type === 'category') {
        promises.push(this.getCategoriesOptimized());
      }

      // ユーザー進捗データの取得
      if (userId) {
        promises.push(this.getUserProgressOptimized(userId));
        
        if (type === 'review') {
          promises.push(this.getDueReviewWordsOptimized(userId));
        }
      }

      const results = await Promise.all(promises);
      
      const response: { words: Word[]; userProgress?: UserProgress[]; categories?: { category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]; reviewWords?: ReviewWord[] } = {
        words: (results[0] as Word[]) || [],
      };

      let index = 1;
      if (type === 'category') {
        response.categories = (results[index++] as { category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]) || [];
      }
      if (userId) {
        response.userProgress = (results[index++] as UserProgress[]) || [];
        if (type === 'review') {
          response.reviewWords = (results[index++] as ReviewWord[]) || [];
        }
      }

      // キャッシュに保存（5分間）
      this.setCache(cacheKey, response, 300000);
      return response;
    } catch (error) {
      console.error('Failed to fetch page data:', error);
      throw error;
    }
  }

  // ============================================================================
  // 進捗更新（キャッシュ無効化付き）
  // ============================================================================

  /**
   * ユーザー進捗を更新（キャッシュも無効化）
   */
  async updateUserProgressOptimized(
    userId: string,
    wordId: string,
    data: {
      isCorrect: boolean;
      studyMode: 'flashcard' | 'quiz';
      responseTime?: number;
    }
  ): Promise<UserProgress> {
    try {
      // 進捗更新
      const { data: updatedProgress, error } = await this.supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          word_id: wordId,
          is_correct: data.isCorrect,
          study_mode: data.studyMode,
          response_time: data.responseTime,
          study_count: 1, // 簡略化
          mastery_level: data.isCorrect ? 0.1 : 0,
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // 関連するキャッシュを無効化
      this.clearCache(`user_progress_${userId}`);
      this.clearCache(`review_words_${userId}`);
      this.clearCache(`page_data_.*_${userId}`);

      return updatedProgress;
    } catch (error) {
      console.error('Failed to update user progress:', error);
      throw error;
    }
  }

  // ============================================================================
  // 統計情報
  // ============================================================================

  /**
   * キャッシュ統計を取得
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    hitRate: number;
  } {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
      hitRate: 0, // 実装時はヒット率を追跡
    };
  }
}
