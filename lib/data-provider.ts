import { unstable_cache } from 'next/cache';
import { Word, UserProgress, Category } from '@/lib/types';
import { DatabaseService } from '@/lib/database';

// 統一キャッシュキー
const CACHE_KEYS = {
  WORDS_BY_CATEGORY: 'words-by-category',
  ALL_WORDS: 'all-words',
  CATEGORIES: 'categories',
  USER_PROGRESS: 'user-progress',
} as const;

// 統一キャッシュ設定
const CACHE_CONFIG = {
  SHORT: { revalidate: 300 }, // 5分
  MEDIUM: { revalidate: 900 }, // 15分
  LONG: { revalidate: 3600 }, // 1時間
  STATIC: { revalidate: 86400 }, // 24時間
} as const;

/**
 * 統一データプロバイダークラス
 * Server ComponentとClient Component両方で使用可能
 */
export class UnifiedDataProvider {
  private static instance: UnifiedDataProvider;
  private db: DatabaseService;

  private constructor() {
    this.db = new DatabaseService();
  }

  public static getInstance(): UnifiedDataProvider {
    if (!UnifiedDataProvider.instance) {
      UnifiedDataProvider.instance = new UnifiedDataProvider();
    }
    return UnifiedDataProvider.instance;
  }

  /**
   * カテゴリー別単語データの取得（キャッシュ付き）
   */
  async getWordsByCategory(category: string): Promise<Word[]> {
    return this.getCachedWordsByCategory(category);
  }

  /**
   * 全単語データの取得（キャッシュ付き）
   */
  async getAllWords(): Promise<Word[]> {
    return this.getCachedAllWords();
  }

  /**
   * カテゴリー一覧の取得（キャッシュ付き）
   */
  async getCategories(): Promise<Category[]> {
    return this.getCachedCategories();
  }

  /**
   * ユーザー進捗データの取得（認証付き、キャッシュ付き）
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.getCachedUserProgress(userId);
  }

  /**
   * 統合データ取得（ページで必要なデータを一括取得）
   */
  async getPageData(type: 'category' | 'quiz' | 'flashcard' | 'review', params: {
    category?: string;
    userId?: string;
  }): Promise<{
    words: Word[];
    userProgress?: UserProgress[];
    categories?: Category[];
  }> {
    switch (type) {
      case 'category':
        const [words, categories, userProgress] = await Promise.all([
          params.category ? this.getWordsByCategory(params.category) : this.getAllWords(),
          this.getCategories(),
          params.userId ? this.getUserProgress(params.userId) : Promise.resolve(undefined)
        ]);
        return {
          words: words || [],
          categories: categories || [],
          userProgress: userProgress || undefined,
        };

      case 'quiz':
      case 'flashcard':
        if (!params.category) throw new Error('Category is required');
        const [categoryWords, progress] = await Promise.all([
          this.getWordsByCategory(params.category),
          params.userId ? this.getUserProgress(params.userId) : Promise.resolve(undefined)
        ]);
        return {
          words: categoryWords || [],
          userProgress: progress || undefined,
        };

      case 'review':
        const [allWords, reviewProgress] = await Promise.all([
          this.getAllWords(),
          params.userId ? this.getUserProgress(params.userId) : Promise.resolve(undefined)
        ]);
        return {
          words: allWords || [],
          userProgress: reviewProgress || undefined,
        };

      default:
        return { words: [] };
    }
  }

  // プライベートキャッシュメソッド
  private getCachedWordsByCategory = unstable_cache(
    async (category: string): Promise<Word[]> => {
      try {
        return await this.db.getWordsByCategory(category);
      } catch (error) {
        console.error('カテゴリー別単語取得エラー:', error);
        return [];
      }
    },
    [CACHE_KEYS.WORDS_BY_CATEGORY],
    {
      tags: [CACHE_KEYS.WORDS_BY_CATEGORY, 'words'],
      ...CACHE_CONFIG.MEDIUM,
    }
  );

  private getCachedAllWords = unstable_cache(
    async (): Promise<Word[]> => {
      try {
        return await this.db.getWords();
      } catch (error) {
        console.error('全単語取得エラー:', error);
        return [];
      }
    },
    [CACHE_KEYS.ALL_WORDS],
    {
      tags: [CACHE_KEYS.ALL_WORDS, 'words'],
      ...CACHE_CONFIG.LONG,
    }
  );

  private getCachedCategories = unstable_cache(
    async (): Promise<Category[]> => {
      try {
        const words = await this.db.getWords();
        const categoryMap = new Map<string, number>();
        
        words.forEach(word => {
          categoryMap.set(word.category, (categoryMap.get(word.category) || 0) + 1);
        });

        return Array.from(categoryMap.entries()).map(([name, count]) => ({
          name,
          count,
          pos: this.getPosSymbol(name)
        }));
      } catch (error) {
        console.error('カテゴリー取得エラー:', error);
        return [];
      }
    },
    [CACHE_KEYS.CATEGORIES],
    {
      tags: [CACHE_KEYS.CATEGORIES, 'categories'],
      ...CACHE_CONFIG.LONG,
    }
  );

  private getCachedUserProgress = unstable_cache(
    async (userId: string): Promise<UserProgress[]> => {
      try {
        return await this.db.getUserProgress(userId);
      } catch (error) {
        console.error('ユーザー進捗取得エラー:', error);
        return [];
      }
    },
    [CACHE_KEYS.USER_PROGRESS],
    {
      tags: [CACHE_KEYS.USER_PROGRESS, 'user-progress'],
      ...CACHE_CONFIG.SHORT,
    }
  );

  private getPosSymbol(category: string): string {
    const posMap: Record<string, string> = {
      'verb': '動',
      'noun': '名',
      'adjective': '形',
      'adverb': '副',
    };
    return posMap[category] || '他';
  }

  /**
   * キャッシュの手動無効化
   */
  static async revalidateCache(type?: keyof typeof CACHE_KEYS) {
    const { revalidateTag } = await import('next/cache');
    
    if (type) {
      revalidateTag(CACHE_KEYS[type]);
    } else {
      // 全キャッシュを無効化
      Object.values(CACHE_KEYS).forEach(key => revalidateTag(key));
    }
  }
}

// シングルトンインスタンスをエクスポート
export const dataProvider = UnifiedDataProvider.getInstance(); 