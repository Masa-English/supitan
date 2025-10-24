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

      // カテゴリーIDから名前を取得
      const { getCategoryNameById } = await import('@/lib/constants/categories');
      const categoryName = getCategoryNameById(category);

      if (!categoryName) {
        throw new Error(`Category not found: ${category}`);
      }

      // 1. 総件数とセクション情報を一度に取得
      const { data: wordsData, error: wordsError } = await this.supabase
        .from('words')
        .select('id, section')
        .eq('category', categoryName);

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
  async getWordsBySection(category: string, section: string): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('category', category)
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
  async getAllWordsInCategory(category: string): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('category', category)
      .order('id', { ascending: true });

    if (error) {
      console.error(`Failed to fetch all words for category ${category}:`, error);
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
