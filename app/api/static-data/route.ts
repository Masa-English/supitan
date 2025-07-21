import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
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

    const staticData = {
      categories: categoryStats,
      totalWords,
      categoryWords,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(staticData);
  } catch (error) {
    console.error('静的データの生成エラー:', error);
    return NextResponse.json(
      { error: '静的データの生成に失敗しました' },
      { status: 500 }
    );
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