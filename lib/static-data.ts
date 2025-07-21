import { Word } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  private async getSupabaseClient() {
    // SSG時はサーバーサイドクライアントを使用
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // SSG時は無視
            }
          },
        },
      },
    );
  }

  async getWords(): Promise<Word[]> {
    try {
      const supabase = await this.getSupabaseClient();
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
      const supabase = await this.getSupabaseClient();
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
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('words')
        .select('category')
        .order('category', { ascending: true });

      if (error) {
        console.error('Categories fetch error:', error);
        return [];
      }

      const categoryCounts = data?.reduce((acc, word) => {
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

export async function getStaticData(): Promise<StaticData> {
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
    
    // 各カテゴリーの単語数を取得
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

export async function getStaticDataForCategory(category: string): Promise<Word[]> {
  try {
    // 環境変数チェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase環境変数が設定されていません。空の配列を返します。');
      return [];
    }

    const db = new StaticDatabaseService();
    const words = await db.getWordsByCategory(category);
    return words;
  } catch (error) {
    console.error('カテゴリー別静的データの取得エラー:', error);
    return [];
  }
}

// キャッシュされた静的データを管理
let cachedStaticData: StaticData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1時間

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