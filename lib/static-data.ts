import { Word } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

export interface StaticData {
  categories: {
    name: string;
    englishName: string;
    count: number;
    pos: string;
    description: string;
    color: string;
    icon: string;
  }[];
  totalWords: number;
  categoryWords: {
    category: string;
    words: Word[];
  }[];
  lastUpdated: string;
}

// 統一キャッシュ設定
// const CACHE_CONFIG = {
//   SHORT: { revalidate: 300 }, // 5分
//   MEDIUM: { revalidate: 900 }, // 15分
//   LONG: { revalidate: 3600 }, // 1時間
//   STATIC: { revalidate: 86400 }, // 24時間
// } as const;

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

  async getWordsByCategory(category: string): Promise<Word[]> {
    try {
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

  async getCategories(): Promise<{ category: string; count: number; englishName: string; pos: string; description: string; color: string; icon: string }[]> {
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

      // 新しいカテゴリー設定を使用
      const { getAllCategories } = await import('./categories');
      const allCategories = getAllCategories();
      
      return allCategories.map(categoryConfig => ({
        category: categoryConfig.name,
        count: categoryCounts[categoryConfig.name] || 0,
        englishName: categoryConfig.englishName,
        pos: categoryConfig.pos,
        description: categoryConfig.description,
        color: categoryConfig.color,
        icon: categoryConfig.icon
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
      englishName: cat.englishName,
      count: cat.count,
      pos: cat.pos,
      description: cat.description,
      color: cat.color,
      icon: cat.icon
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
    categories: [
      { name: '動詞', englishName: 'Verbs', count: 0, pos: 'V', description: '動作や状態を表す動詞', color: '#3B82F6', icon: '⚡' },
      { name: '句動詞', englishName: 'Phrasal Verbs', count: 0, pos: 'PV', description: '動詞と前置詞・副詞の組み合わせ', color: '#8B5CF6', icon: '🔗' },
      { name: '形容詞', englishName: 'Adjectives', count: 0, pos: 'ADJ', description: '人や物の性質・状態を表す形容詞', color: '#10B981', icon: '🎨' },
      { name: '副詞', englishName: 'Adverbs', count: 0, pos: 'ADV', description: '動詞・形容詞・副詞を修飾する副詞', color: '#F59E0B', icon: '⚙️' },
      { name: '名詞', englishName: 'Nouns', count: 0, pos: 'N', description: '人・物・事柄を表す名詞', color: '#EF4444', icon: '📦' },
      { name: 'フレーズ', englishName: 'Phrases', count: 0, pos: 'PHR', description: 'よく使われる表現やフレーズ', color: '#06B6D4', icon: '💬' },
      { name: 'イディオム', englishName: 'Idioms', count: 0, pos: 'IDIOM', description: '慣用句やイディオム', color: '#EC4899', icon: '🎭' },
      { name: 'リアクション', englishName: 'Reactions', count: 0, pos: 'REACT', description: '感情や反応を表す表現', color: '#84CC16', icon: '😊' }
    ],
    totalWords: 0,
    categoryWords: [],
    lastUpdated: new Date().toISOString()
  };
}

function getEnglishName(category: string): string {
  const englishMap: Record<string, string> = {
    '動詞': 'Verb',
    '形容詞': 'Adjective',
    '副詞': 'Adverb',
    '名詞': 'Noun',
    '代名詞': 'Pronoun',
    '前置詞': 'Preposition',
    '助動詞': 'Auxiliary Verb',
    '感嘆詞': 'Interjection',
    '接続詞': 'Conjunction'
  };
  return englishMap[category] || category;
}

function getPosSymbol(category: string): string {
  const posMap: Record<string, string> = {
    '動詞': 'V',
    '形容詞': 'Adj',
    '副詞': 'Adv',
    '名詞': 'N',
    '代名詞': 'Pron',
    '前置詞': 'Prep',
    '助動詞': 'Aux',
    '感嘆詞': 'Int',
    '接続詞': 'Conj'
  };
  return posMap[category] || '';
}

// キャッシュ管理（Next.js 15では不要）
export async function revalidateStaticData() {
  // Next.js 15ではキャッシュ管理が変更されたため、この関数は現在使用されていません
  // 将来的なISRキャッシュ管理のために保持
} 