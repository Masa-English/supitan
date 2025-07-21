import { Word } from '@/lib/types';

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

export async function getStaticData(): Promise<StaticData> {
  try {
    // ビルド時は直接データベースから取得
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      const { DatabaseService } = await import('@/lib/database');
      const db = new DatabaseService();
      
      // カテゴリー一覧を取得
      const categories = await db.getCategories();
      
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
    } else {
      // 開発時はAPIから取得
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/static-data`, {
        next: { 
          revalidate: 3600, // 1時間ごとに再検証
          tags: ['static-data']
        }
      });
      
      if (!response.ok) {
        throw new Error('静的データの取得に失敗しました');
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('静的データの取得エラー:', error);
    throw error;
  }
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
    // ビルド時は直接データベースから取得
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      const { DatabaseService } = await import('@/lib/database');
      const db = new DatabaseService();
      const words = await db.getWordsByCategory(category);
      return words;
    } else {
      // 開発時はAPIから取得
      const staticData = await getStaticData();
      const categoryData = staticData.categoryWords.find(
        cw => cw.category === category
      );
      return categoryData?.words || [];
    }
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