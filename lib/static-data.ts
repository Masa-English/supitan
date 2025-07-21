import { Word } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export interface StaticData {
  categories: {
    name: string;
    count: number;
    pos: string;
  }[];
  totalWords: number;
  categoryWords: {
    category: string;
    words: Word[];
  }[];
  lastUpdated: string;
}

// SSG用のデータベースサービス
class StaticDatabaseService {
  private getSupabaseClient() {
    // 環境変数の存在確認を強化
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    try {
      // 静的生成用のシンプルなクライアント（認証なし）
      return createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.error('Supabase client creation error:', error);
      throw error;
    }
  }

  // ヘルスチェック機能を追加
  async checkConnection(): Promise<boolean> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
        .from('words')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Database connection check failed:', error);
        return false;
      }
      
      console.log('Database connection check successful');
      return true;
    } catch (error) {
      console.error('Database connection check error:', error);
      return false;
    }
  }

  async getWords(): Promise<Word[]> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Words fetch error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('getWords error:', error);
      return [];
    }
  }

  async getWordsByCategory(category: string): Promise<Word[]> {
    try {
      // 接続チェックを先に実行
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.error('Database connection failed for category:', category);
        return [];
      }

      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('category', category)
        .order('word', { ascending: true });

      if (error) {
        console.error('Words by category fetch error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('getWordsByCategory error:', error);
      return [];
    }
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('words')
        .select('category')
        .order('category', { ascending: true });

      if (error) {
        console.error('Categories fetch error:', error);
        return [];
      }

      const categoryCounts = data?.reduce((acc: Record<string, number>, word: { category: string }) => {
        acc[word.category] = (acc[word.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCounts || {}).map(([category, count]) => ({
        category,
        count
      }));
    } catch (error) {
      console.error('getCategories error:', error);
      return [];
    }
  }
}

// キャッシュされた静的データ取得（Next.js 15のunstable_cache使用）
const getCachedStaticDataInternal = unstable_cache(
  async (): Promise<StaticData> => {
    try {
      // 環境変数チェック
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase環境変数が設定されていません。デフォルトデータを返します。');
        return getDefaultStaticData();
      }

      const db = new StaticDatabaseService();
      
      // カテゴリー一覧を取得
      const categories = await db.getCategories();
      
      if (categories.length === 0) {
        console.warn('カテゴリーが取得できませんでした。デフォルトデータを返します。');
        return getDefaultStaticData();
      }
      
      // 各カテゴリーの単語数を取得（並列実行で高速化）
      const categoryStats = await Promise.all(
        categories.map(async (cat) => {
          const words = await db.getWordsByCategory(cat.category);
          return {
            name: cat.category,
            count: words.length,
            pos: getPosSymbol(cat.category)
          };
        })
      );

      // 全体的な統計情報
      const allWords = await db.getWords();
      const totalWords = allWords.length;
      
      // カテゴリー別の単語データ（最初の10個のみ）
      const categoryWords = await Promise.all(
        categories.map(async (cat) => {
          const words = await db.getWordsByCategory(cat.category);
          return {
            category: cat.category,
            words: words.slice(0, 10) // 最初の10個のみ
          };
        })
      );

      return {
        categories: categoryStats,
        totalWords,
        categoryWords,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('静的データの取得エラー:', error);
      return getDefaultStaticData();
    }
  },
  ['static-data'],
  {
    tags: ['static-data', 'words', 'categories'],
    revalidate: 900, // 15分キャッシュ
  }
);

// カテゴリー別データのキャッシュ
const getCachedCategoryData = unstable_cache(
  async (category: string): Promise<Word[]> => {
    console.log(`カテゴリー別データ取得開始: ${category}`);
    
    try {
      // 環境変数チェック
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase環境変数が設定されていません。空の配列を返します。');
        return [];
      }

      // リトライ機能付きでデータ取得
      const db = new StaticDatabaseService();
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`データ取得試行 ${attempt}/${maxRetries} for category: ${category}`);
          const words = await db.getWordsByCategory(category);
          console.log(`データ取得成功: ${category}, 単語数: ${words.length}`);
          return words;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          console.error(`データ取得試行 ${attempt} 失敗:`, lastError.message);
          
          // 最後の試行でない場合は少し待つ
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      // すべてのリトライが失敗した場合
      console.error(`カテゴリー別データ取得が最終的に失敗: ${category}`, lastError);
      return [];
    } catch (error) {
      console.error('カテゴリー別静的データの取得エラー:', error);
      return [];
    }
  },
  ['category-data'],
  {
    tags: ['category-data', 'words'],
    revalidate: 1800, // 30分キャッシュ
  }
);

export async function getStaticData(): Promise<StaticData> {
  return getCachedStaticDataInternal();
}

export async function getStaticDataForCategory(category: string): Promise<Word[]> {
  return getCachedCategoryData(category);
}

function getDefaultStaticData(): StaticData {
  const defaultCategories = ['動詞', '形容詞', '副詞', '名詞'];
  return {
    categories: defaultCategories.map(name => ({
      name,
      count: 0,
      pos: getPosSymbol(name)
    })),
    totalWords: 0,
    categoryWords: defaultCategories.map(category => ({
      category,
      words: []
    })),
    lastUpdated: new Date().toISOString()
  };
}

function getPosSymbol(category: string): string {
  const posMap: Record<string, string> = {
    '動詞': 'V',
    '形容詞': 'Adj',
    '副詞': 'Adv',
    '名詞': 'N'
  };
  return posMap[category] || '';
}

// レガシーキャッシュ管理（後方互換性のため残す）
let cachedStaticData: StaticData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 900000; // 15分

export async function getCachedStaticData(): Promise<StaticData> {
  const now = Date.now();
  
  if (cachedStaticData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedStaticData;
  }
  
  const data = await getStaticData();
  cachedStaticData = data;
  cacheTimestamp = now;
  
  return data;
}

// キャッシュクリア用の関数
export function clearStaticDataCache() {
  cachedStaticData = null;
  cacheTimestamp = 0;
} 