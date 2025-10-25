import { Word } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

export interface StaticData {
  categories: {
    name: string;
    count: number;
    description: string;
    color: string;
    sort_order: number;
    is_active: boolean;
  }[];
  totalWords: number;
  categoryWords: {
    category: string;
    words: Word[];
  }[];
  lastUpdated: string;
}

// 統一キャッシュ設定
export const CACHE_CONFIG = {
  SHORT: { revalidate: 300 }, // 5分
  MEDIUM: { revalidate: 900 }, // 15分
  LONG: { revalidate: 3600 }, // 1時間
  STATIC: { revalidate: 86400 }, // 24時間
} as const;

// SSG用のデータベースサービス
class StaticDatabaseService {
  private getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    try {
      return createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.error('Supabase client creation error:', error);
      throw error;
    }
  }

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

  async getWordsByCategory(categoryId: string): Promise<Word[]> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.error('Database connection failed for category ID:', categoryId);
        return [];
      }

      const supabase = this.getSupabaseClient();
      
      // categoryIdがUUID形式かどうかをチェック
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      
      let query;
      if (isUuid) {
        // UUID形式の場合は直接検索
        query = supabase
          .from('words')
          .select('*')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .order('word', { ascending: true });
      } else {
        // カテゴリー名の場合は、まずカテゴリーIDを取得
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryId)
          .eq('is_active', true)
          .single();

        if (categoryError || !categoryData) {
          console.error('Category not found:', categoryId);
          return [];
        }

        query = supabase
          .from('words')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('word', { ascending: true });
      }

      const { data, error } = await query;

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

  async getCategories(): Promise<{ category: string; count: number; description: string; color: string; sort_order: number; is_active: boolean }[]> {
    try {
      const supabase = this.getSupabaseClient();
      
      // カテゴリーテーブルから直接取得
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Categories fetch error:', categoriesError);
        return [];
      }

      // 各カテゴリーの単語数を取得（category_idを使用）
      const categoryCounts: Record<string, number> = {};
      for (const category of categoriesData || []) {
        const { count, error: countError } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id) // category_idで検索
          .eq('is_active', true);

        if (!countError) {
          categoryCounts[category.name] = count || 0;
        }
      }

      // データベースから取得したカテゴリー情報を直接使用
      return (categoriesData || []).map(category => ({
        category: category.name,
        count: categoryCounts[category.name] || 0,
        description: category.description || '',
        color: category.color || '#3b82f6',
        sort_order: category.sort_order || 0,
        is_active: category.is_active || true
      }));
    } catch (error) {
      console.error('getCategories error:', error);
      return [];
    }
  }
}

// 静的データ取得
async function getStaticDataInternal(): Promise<StaticData> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase環境変数が設定されていません。デフォルトデータを返します。');
      return getDefaultStaticData();
    }

    const db = new StaticDatabaseService();
    
    // 並列実行で高速化
    const [categories, allWords] = await Promise.all([
      db.getCategories(),
      db.getWords()
    ]);
    
    if (categories.length === 0) {
      console.warn('カテゴリーが取得できませんでした。デフォルトデータを返します。');
      return getDefaultStaticData();
    }
    
    // カテゴリー統計の計算
    const categoryStats = categories.map((cat) => ({
      name: cat.category,
      count: cat.count,
      description: cat.description,
      color: cat.color,
      sort_order: cat.sort_order,
      is_active: cat.is_active
    }));

    // カテゴリー別の単語データ（最初の10個のみ）
    const categoryWords = await Promise.all(
      categories.map(async (cat) => {
        const words = await db.getWordsByCategory(cat.category);
        return {
          category: cat.category,
          words: words.slice(0, 10)
        };
      })
    );

    return {
      categories: categoryStats,
      totalWords: allWords.length,
      categoryWords,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('静的データの取得エラー:', error);
    return getDefaultStaticData();
  }
}

// カテゴリー別データ取得
async function getCategoryDataInternal(category: string): Promise<Word[]> {
  try {
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

export async function getStaticData(): Promise<StaticData> {
  return getStaticDataInternal();
}

export async function getStaticDataForCategory(category: string): Promise<Word[]> {
  return getCategoryDataInternal(category);
}

function getDefaultStaticData(): StaticData {
  return {
    categories: [],
    totalWords: 0,
    categoryWords: [],
    lastUpdated: new Date().toISOString()
  };
}

// キャッシュ管理（Next.js 15では不要）
export async function revalidateStaticData() {
  // Next.js 15ではキャッシュ管理が変更されたため、この関数は現在使用されていません
  // 将来的なISRキャッシュ管理のために保持
}