/**
 * 最適化されたセクション選択ページ用データサービス
 * パフォーマンス向上とリアルタイム更新を実装
 */

import { createClient as createPublicClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Word } from '@/lib/types';

interface SectionInfo {
  section: string;
  count: number;
}

interface OptimizedSectionData {
  totalCount: number;
  sections: SectionInfo[];
  wordsCount: number;
}

export class OptimizedSectionService {
  private supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * 最適化されたセクションデータ取得
   * 単一クエリで全ての情報を取得
   */
  private getOptimizedSectionData = unstable_cache(
    async (category: string): Promise<OptimizedSectionData> => {
      console.log(`[OptimizedSection] Fetching data for category: ${category}`);

      // カテゴリーIDから名前を取得（一時的に静的マッピングを使用）
      const categoryMap: Record<string, string> = {
        'b464ce08-9440-4178-923f-4d251b8dc0ab': '動詞',
        '6effaf5d-619c-4a70-b36d-9464549eadda': '句動詞',
        '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9': '形容詞',
        '71bfd0a1-cc79-4257-bd4a-15d30d37555f': '副詞',
        '618464f6-6c7a-450a-9074-89e6d7becef9': '名詞',
        'db7620f6-7347-4cec-8a88-da3f8a27cc98': 'フレーズ',
        'fd181354-21ea-48d7-b4fa-8b6e1ca0264c': 'イディオム',
        '301aab35-e5ee-4136-98ba-ca272bb813d4': 'リアクション',
        '5a55ffb9-d020-49ac-81be-a256d7a24c8f': 'イディオム (副詞句)',
        '41240a24-458d-4184-9ef6-e8d1c8620d9d': 'イディオム(動詞+名詞句)',
        'ee6355f8-bd2d-46f3-8342-ccb80369c185': 'コロケーション',
        'b4bec9d1-a451-47f4-b1b6-2b1f0ef586f8': 'コロケーション（動詞+前置詞＋名詞)',
        '10d85f98-a88b-4f28-a20f-0a5b9851ff02': 'コロケーション（動詞+名詞型)',
        'c6ab103e-e829-41e0-9482-85e8e0a59b25': 'コロケーション（形容詞+前置詞型）',
        '47f218b0-1a67-4ce3-86bf-503cbcbc4376': '基礎動詞'
      };
      
      const categoryName = categoryMap[category];
      if (!categoryName) {
        throw new Error(`Category not found: ${category}`);
      }

      // 1. 総件数とセクション情報を一度に取得
      const { data: wordsData, error: wordsError } = await this.supabase
        .from('words')
        .select('id, section')
        .eq('category_id', category);

      if (wordsError) {
        console.error('Failed to fetch words data:', wordsError);
        throw wordsError;
      }

      const totalCount = wordsData?.length || 0;
      
      // 2. セクション別の件数を効率的に計算
      const sectionCounts = new Map<string, number>();
      
      for (const word of wordsData || []) {
        const section = String(word.section ?? '未設定');
        sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1);
      }

      // 3. セクション情報を配列に変換
      const sections: SectionInfo[] = Array.from(sectionCounts.entries())
        .map(([section, count]) => ({ section, count }))
        .sort((a, b) => {
          // 数値セクションを優先してソート
          const aNum = parseInt(a.section);
          const bNum = parseInt(b.section);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          if (!isNaN(aNum)) return -1;
          if (!isNaN(bNum)) return 1;
          
          return a.section.localeCompare(b.section);
        });

      console.log(`[OptimizedSection] Found ${totalCount} words in ${sections.length} sections`);

      return {
        totalCount,
        sections,
        wordsCount: totalCount,
      };
    },
    ['optimized-section-data'],
    {
      tags: ['words', 'sections'],
      revalidate: 300, // 5分キャッシュ
    }
  );

  /**
   * セクションデータを取得（公開メソッド）
   */
  async getSectionData(category: string): Promise<OptimizedSectionData> {
    return this.getOptimizedSectionData(category);
  }

  /**
   * セクション別の単語を取得（遅延読み込み用）
   */
  async getWordsBySection(categoryId: string, section: string): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('category_id', categoryId)
      .eq('section', section === '未設定' ? null : section)
      .order('id', { ascending: true });

    if (error) {
      console.error(`Failed to fetch words for section ${section}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * カテゴリー内の全単語を取得（遅延読み込み用）
   */
  async getAllWordsInCategory(categoryId: string): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('category_id', categoryId)
      .order('id', { ascending: true });

    if (error) {
      console.error(`Failed to fetch all words for category ID ${categoryId}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * キャッシュを無効化
   */
  async invalidateCache(category?: string): Promise<void> {
    // Next.js の revalidateTag を使用してキャッシュを無効化
    if (typeof window === 'undefined') {
      const { revalidateTag } = await import('next/cache');
      if (category) {
        revalidateTag(`words-${category}`);
      }
      revalidateTag('words');
      revalidateTag('sections');
    }
  }
}

// シングルトンインスタンス
export const optimizedSectionService = new OptimizedSectionService();
