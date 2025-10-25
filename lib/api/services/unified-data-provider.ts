/**
 * 統一されたデータプロバイダー
 * 効率的なキャッシュ戦略とエラーハンドリングを備えた最適化されたデータアクセス層
 */

import { createClient } from '@/lib/api/supabase/client';
import type { Word, Category, UserProgress, ReviewWord, UserProfile } from '@/lib/types';

// ============================================================================
// 型定義
// ============================================================================

export interface DataProviderOptions {
  cache?: boolean;
  revalidate?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  category?: string;
  difficulty?: number;
  mastered?: boolean;
  favorites?: boolean;
  search?: string;
}

export type DataProviderResult<T> = {
  data: T;
  error: null;
  cached?: boolean;
} | {
  data: null;
  error: string;
  cached?: false;
}

// ============================================================================
// キャッシュ管理
// ============================================================================

class DataCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // 5分デフォルト
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// ============================================================================
// 統一データプロバイダー
// ============================================================================

export class UnifiedDataProvider {
  private cache = new DataCache();
  private supabase = createClient();
  
  // ============================================================================
  // 単語データ
  // ============================================================================
  
  async getWords(options: DataProviderOptions & FilterOptions & PaginationOptions = {}): Promise<DataProviderResult<Word[]>> {
    const cacheKey = `words:${JSON.stringify(options)}`;
    
    // キャッシュチェック
    if (options.cache !== false) {
      const cached = this.cache.get<Word[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      let query = this.supabase
        .from('words')
        .select('*');
      
      // フィルター適用
      if (options.category) {
        query = query.eq('category_id', options.category);
      }
      
      if (options.difficulty !== undefined) {
        query = query.eq('difficulty_level', options.difficulty);
      }
      
      if (options.search) {
        query = query.or(`english.ilike.%${options.search}%,japanese.ilike.%${options.search}%`);
      }
      
      // ページネーション
      if (options.limit) {
        const offset = options.offset || (options.page ? (options.page - 1) * options.limit : 0);
        query = query.range(offset, offset + options.limit - 1);
      }
      
      // 順序
      query = query.order('id');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch words:', error);
        return { data: null, error: error.message };
      }
      
      const words = data || [];
      
      // キャッシュに保存
      if (options.cache !== false) {
        this.cache.set(cacheKey, words, options.revalidate);
      }
      
      return { data: words, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching words:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  async getWordsByCategory(category: string, options: DataProviderOptions = {}): Promise<DataProviderResult<Word[]>> {
    return this.getWords({ ...options, category });
  }
  
  async getWordById(id: string, options: DataProviderOptions = {}): Promise<DataProviderResult<Word | null>> {
    const cacheKey = `word:${id}`;
    
    // キャッシュチェック
    if (options.cache !== false) {
      const cached = this.cache.get<Word>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      const { data, error } = await this.supabase
        .from('words')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }; // Not found is not an error
        }
        console.error('Failed to fetch word:', error);
        return { data: null, error: error.message };
      }
      
      // キャッシュに保存
      if (options.cache !== false && data) {
        this.cache.set(cacheKey, data, options.revalidate);
      }
      
      return { data, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching word:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  // ============================================================================
  // カテゴリーデータ
  // ============================================================================
  
  async getCategories(options: DataProviderOptions = {}): Promise<DataProviderResult<Category[]>> {
    const cacheKey = 'categories';
    
    // キャッシュチェック
    if (options.cache !== false) {
      const cached = this.cache.get<Category[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Failed to fetch categories:', error);
        return { data: null, error: error.message };
      }
      
      const categories = data || [];
      
      // キャッシュに保存（カテゴリーは変更頻度が低いので長めにキャッシュ）
      if (options.cache !== false) {
        this.cache.set(cacheKey, categories, options.revalidate || 1800000); // 30分
      }
      
      return { data: categories, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching categories:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  // ============================================================================
  // ユーザー進捗データ
  // ============================================================================
  
  async getUserProgress(
    userId: string, 
    wordIds?: string[], 
    options: DataProviderOptions = {}
  ): Promise<DataProviderResult<UserProgress[]>> {
    const cacheKey = `user_progress:${userId}:${wordIds?.join(',') || 'all'}`;
    
    // キャッシュチェック（進捗データは短めのキャッシュ）
    if (options.cache !== false) {
      const cached = this.cache.get<UserProgress[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      let query = this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (wordIds && wordIds.length > 0) {
        query = query.in('word_id', wordIds);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch user progress:', error);
        return { data: null, error: error.message };
      }
      
      const progress = data || [];
      
      // キャッシュに保存（進捗データは短めにキャッシュ）
      if (options.cache !== false) {
        this.cache.set(cacheKey, progress, options.revalidate || 60000); // 1分
      }
      
      return { data: progress, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching user progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  async updateUserProgress(
    userId: string, 
    wordId: string, 
    updates: Partial<UserProgress>
  ): Promise<DataProviderResult<UserProgress>> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          word_id: wordId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Failed to update user progress:', error);
        return { data: null, error: error.message };
      }
      
      // 関連キャッシュを無効化
      this.cache.invalidate(`user_progress:${userId}`);
      
      return { data, error: null };
      
    } catch (error) {
      console.error('Unexpected error updating user progress:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  // ============================================================================
  // 復習単語データ
  // ============================================================================
  
  async getReviewWords(
    userId: string, 
    options: DataProviderOptions = {}
  ): Promise<DataProviderResult<ReviewWord[]>> {
    const cacheKey = `review_words:${userId}`;
    
    // キャッシュチェック
    if (options.cache !== false) {
      const cached = this.cache.get<ReviewWord[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      const { data, error } = await this.supabase
        .from('review_words')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString())
        .order('next_review');
      
      if (error) {
        console.error('Failed to fetch review words:', error);
        return { data: null, error: error.message };
      }
      
      const reviewWords = data || [];
      
      // キャッシュに保存（復習データは短めにキャッシュ）
      if (options.cache !== false) {
        this.cache.set(cacheKey, reviewWords, options.revalidate || 300000); // 5分
      }
      
      return { data: reviewWords, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching review words:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  // ============================================================================
  // ユーザープロフィール
  // ============================================================================
  
  async getUserProfile(
    userId: string, 
    options: DataProviderOptions = {}
  ): Promise<DataProviderResult<UserProfile | null>> {
    const cacheKey = `user_profile:${userId}`;
    
    // キャッシュチェック
    if (options.cache !== false) {
      const cached = this.cache.get<UserProfile>(cacheKey);
      if (cached) {
        return { data: cached, error: null, cached: true };
      }
    }
    
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }; // Not found is not an error
        }
        console.error('Failed to fetch user profile:', error);
        return { data: null, error: error.message };
      }
      
      // キャッシュに保存
      if (options.cache !== false && data) {
        this.cache.set(cacheKey, data, options.revalidate || 600000); // 10分
      }
      
      return { data, error: null };
      
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  // ============================================================================
  // キャッシュ管理
  // ============================================================================
  
  invalidateCache(pattern?: string): void {
    this.cache.invalidate(pattern);
  }
  
  clearCache(): void {
    this.cache.invalidate();
  }
  
  getCacheStats(): { size: number; keys: string[] } {
    const keys = Array.from(this.cache['cache'].keys());
    return {
      size: keys.length,
      keys,
    };
  }
}

// ============================================================================
// シングルトンインスタンス
// ============================================================================

let dataProviderInstance: UnifiedDataProvider | null = null;

export function getDataProvider(): UnifiedDataProvider {
  if (!dataProviderInstance) {
    dataProviderInstance = new UnifiedDataProvider();
  }
  return dataProviderInstance;
}

// ============================================================================
// 便利関数
// ============================================================================

export async function getWordsWithProgress(
  category: string, 
  userId?: string
): Promise<DataProviderResult<(Word & { progress?: UserProgress })[]>> {
  const provider = getDataProvider();
  
  // 単語データを取得
  const wordsResult = await provider.getWordsByCategory(category);
  if (wordsResult.error) {
    return wordsResult as DataProviderResult<(Word & { progress?: UserProgress })[]>;
  }
  
  // ユーザー進捗データを取得（ユーザーが指定されている場合）
  if (userId && wordsResult.data) {
    const wordIds = wordsResult.data.map(word => word.id);
    const progressResult = await provider.getUserProgress(userId, wordIds);
    
    if (progressResult.error) {
      // 進捗データの取得に失敗しても単語データは返す
      console.warn('Failed to fetch progress data:', progressResult.error);
      return { data: wordsResult.data, error: null };
    }
    
    // 進捗データを単語データにマージ
    if (progressResult.data) {
      const progressMap = new Map(progressResult.data.map(p => [p.word_id, p]));
      const wordsWithProgress = wordsResult.data.map(word => ({
        ...word,
        progress: progressMap.get(word.id),
      }));
      
      return { data: wordsWithProgress, error: null };
    }
  }
  
  return { data: wordsResult.data || [], error: null };
}
