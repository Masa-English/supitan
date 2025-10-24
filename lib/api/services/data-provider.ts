import { Word, UserProgress, CategoryWithStats, ReviewWord } from '@/lib/types';
import { DatabaseService } from '@/lib/api/database';

// 実行環境の判定
const isServer = typeof window === 'undefined';

// サーバーサイドでのみunstable_cacheをインポート
let unstable_cache: typeof import('next/cache').unstable_cache | null = null;

// 動的インポートを関数内で実行
async function initializeCache() {
  if (isServer && !unstable_cache) {
    try {
      const nextCache = await import('next/cache');
      unstable_cache = nextCache.unstable_cache;
    } catch {
      console.warn('Next.js cache functions not available');
    }
  }
}

// 統一キャッシュキー
const CACHE_KEYS = {
  WORDS_BY_CATEGORY: 'words-by-category',
  ALL_WORDS: 'all-words',
  CATEGORIES: 'categories',
  USER_PROGRESS: 'user-progress',
} as const;

// 統一キャッシュ設定
const CACHE_CONFIG = {
  SHORT: { revalidate: 300 }, // 5分 - ユーザー進捗など頻繁に変わるデータ
  MEDIUM: { revalidate: 900 }, // 15分 - カテゴリー別単語データ
  LONG: { revalidate: 3600 }, // 1時間 - 全単語データ、カテゴリー一覧
  STATIC: { revalidate: 86400 }, // 24時間 - 基本的に変わらないデータ
  VERY_LONG: { revalidate: 604800 }, // 1週間 - ほぼ静的なデータ
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
    // キャッシュを初期化
    await initializeCache();
       
    if (isServer && unstable_cache) {
      return this.getCachedWordsByCategory(category);
    }
    // クライアントサイドでは直接データベースアクセス
    try {
      return await this.db.getWordsByCategory(category);
    } catch (error) {
      console.error('カテゴリー別単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * 全単語データの取得（キャッシュ付き）
   */
  async getAllWords(): Promise<Word[]> {
    await initializeCache();
    
    if (isServer && unstable_cache) {
      return this.getCachedAllWords();
    }
    // クライアントサイドでは直接データベースアクセス
    try {
      return await this.db.getWords();
    } catch (error) {
      console.error('全単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * カテゴリー一覧の取得（キャッシュ付き）
   */
  async getCategories(): Promise<CategoryWithStats[]> {
    await initializeCache();
    
    if (isServer && unstable_cache) {
      return this.getCachedCategories();
    }
    // クライアントサイドでは直接データベースアクセス
    try {
      return await this.db.getCategories();
    } catch (error) {
      console.error('カテゴリー取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * ユーザー進捗データの取得（認証付き、キャッシュ付き）
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    await initializeCache();
    
    if (isServer && unstable_cache) {
      return this.getCachedUserProgress(userId);
    }
    // クライアントサイドでは直接データベースアクセス
    try {
      return await this.db.getUserProgress(userId);
    } catch (error) {
      console.error('ユーザー進捗取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * 復習リストの単語を取得（認証付き、キャッシュ付き）
   */
  async getReviewWords(userId: string): Promise<ReviewWord[]> {
    await initializeCache();
    
    if (isServer && unstable_cache) {
      return this.getCachedReviewWords(userId);
    }
    // クライアントサイドでは直接データベースアクセス
    try {
      return await this.db.getReviewWords(userId);
    } catch (error) {
      console.error('復習リスト取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
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
    categories?: CategoryWithStats[];
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

  // プライベートキャッシュメソッド（サーバーサイドのみ）
  private getCachedWordsByCategory = isServer && unstable_cache ? unstable_cache(
    async (category: string): Promise<Word[]> => {
      try {
        console.log(`[Cache] Getting words for category: "${category}"`);
        return await this.db.getWordsByCategory(category);
      } catch (error) {
        console.error('カテゴリー別単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    [CACHE_KEYS.WORDS_BY_CATEGORY],
    {
      tags: [CACHE_KEYS.WORDS_BY_CATEGORY, 'words'],
      ...CACHE_CONFIG.MEDIUM,
    }
  ) : async (category: string) => {
    try {
      return await this.db.getWordsByCategory(category);
    } catch (error) {
      console.error('カテゴリー別単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

  private getCachedAllWords = isServer && unstable_cache ? unstable_cache(
    async (): Promise<Word[]> => {
      try {
        return await this.db.getWords();
      } catch (error) {
        console.error('全単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    [CACHE_KEYS.ALL_WORDS],
    {
      tags: [CACHE_KEYS.ALL_WORDS, 'words'],
      ...CACHE_CONFIG.LONG,
    }
  ) : async () => {
    try {
      return await this.db.getWords();
    } catch (error) {
      console.error('全単語取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

  private getCachedCategories = isServer && unstable_cache ? unstable_cache(
    async (): Promise<CategoryWithStats[]> => {
      try {
        return await this.db.getCategories();
      } catch (error) {
        console.error('カテゴリー取得エラー:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    [CACHE_KEYS.CATEGORIES],
    {
      tags: [CACHE_KEYS.CATEGORIES, 'categories'],
      ...CACHE_CONFIG.LONG,
    }
  ) : async () => {
    try {
      return await this.db.getCategories();
    } catch (error) {
      console.error('カテゴリー取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

  private getCachedUserProgress = isServer && unstable_cache ? unstable_cache(
    async (userId: string): Promise<UserProgress[]> => {
      try {
        return await this.db.getUserProgress(userId);
      } catch (error) {
        console.error('ユーザー進捗取得エラー:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    [CACHE_KEYS.USER_PROGRESS],
    {
      tags: [CACHE_KEYS.USER_PROGRESS, 'user-progress'],
      ...CACHE_CONFIG.SHORT,
    }
  ) : async (userId: string) => {
    try {
      return await this.db.getUserProgress(userId);
    } catch (error) {
      console.error('ユーザー進捗取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

  private getCachedReviewWords = isServer && unstable_cache ? unstable_cache(
    async (userId: string): Promise<ReviewWord[]> => {
      try {
        return await this.db.getReviewWords(userId);
      } catch (error) {
        console.error('復習リスト取得エラー:', error instanceof Error ? error.message : 'Unknown error');
        return [];
      }
    },
    ['review-words'],
    {
      tags: ['review-words', 'user-progress'],
      ...CACHE_CONFIG.SHORT,
    }
  ) : async (userId: string) => {
    try {
      return await this.db.getReviewWords(userId);
    } catch (error) {
      console.error('復習リスト取得エラー:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

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
   * キャッシュの手動無効化（サーバーサイドのみ）
   */
  static async revalidateCache(type?: keyof typeof CACHE_KEYS) {
    if (!isServer) return;
    
    try {
      const { revalidateTag } = await import('next/cache');
      
      if (type) {
        revalidateTag(CACHE_KEYS[type]);
      } else {
        // 全キャッシュを無効化
        Object.values(CACHE_KEYS).forEach(key => revalidateTag(key));
      }
    } catch (error) {
      console.warn('Cache revalidation failed:', error);
    }
  }
}

// シングルトンインスタンスをエクスポート
export const dataProvider = UnifiedDataProvider.getInstance();