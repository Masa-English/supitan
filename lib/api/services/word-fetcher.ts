import { createClient } from '@supabase/supabase-js';
import type { Word } from '@/lib/types';

interface FetchOptions {
  category?: string;
  sectionIndex?: number; // 1-based (legacy)
  sectionSize?: number;  // 任意サイズ (legacy)
  randomCount?: number;  // ランダム件数
  sectionValue?: number | string; // words.section の値で絞り込み
}

export async function fetchWordsForStudy(options: FetchOptions): Promise<Word[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { category: categoryId, sectionIndex, sectionSize, randomCount, sectionValue } = options;

  // カテゴリーIDから名前を取得（データベース検索用）
  let categoryName: string | undefined;
  if (categoryId) {
    const { getCategoryNameById } = await import('@/lib/constants/categories');
    categoryName = getCategoryNameById(categoryId);
    if (!categoryName) {
      throw new Error(`Category not found: ${categoryId}`);
    }
  }

  const category = categoryName;

  // JOINクエリでカテゴリー情報も取得
  const baseSelect = `
    *,
    categories (
      id,
      name,
      description,
      color,
      sort_order,
      is_active
    )
  `;

  // ランダム優先
  if (randomCount && randomCount > 0) {
    // 軽量にIDのみ取得 → サンプリング → 本体取得
    let idQuery = supabase.from('words').select('id');
    if (category) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryData) {
        idQuery = idQuery.eq('category_id', categoryData.id);
      }
    }
    const { data: ids, error: idsErr } = await idQuery;
    if (idsErr) throw idsErr;
    const pool = (ids ?? []).map((r) => r.id);
    const selected = sampleIds(pool, randomCount);
    if (selected.length === 0) return [];
    const { data, error } = await supabase.from('words').select(baseSelect).in('id', selected);
    if (error) throw error;
    // 表示安定のため単語で並び替え
    return (data ?? []).sort((a, b) => (a.word || '').localeCompare(b.word || '')) as Word[];
  }

  // section列の値でフィルタ（推奨）
  if (sectionValue !== undefined && sectionValue !== null && sectionValue !== '') {
    let q = supabase.from('words').select(baseSelect);
    if (category) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryData) {
        q = q.eq('category_id', categoryData.id);
      }
    }
    q = q.eq('section', sectionValue);
    const { data, error } = await q.order('word', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Word[];
  }

  // セクション取得（柔軟サイズ：従来仕様）
  if (sectionIndex && sectionIndex > 0 && sectionSize && sectionSize > 0) {
    const from = (sectionIndex - 1) * sectionSize;
    const to = from + sectionSize - 1;
    let q = supabase
      .from('words')
      .select(baseSelect)
      .order('word', { ascending: true })
      .range(from, to);
    if (category) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryData) {
        q = q.eq('category_id', categoryData.id);
      }
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Word[];
  }

  // カテゴリー全件（フォールバック）
  let q = supabase
    .from('words')
    .select(baseSelect)
    .order('word', { ascending: true });
  if (category) {
    // まずカテゴリーIDを取得
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();
    
    if (categoryData) {
      q = q.eq('category_id', categoryData.id);
    }
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Word[];
}

function sampleIds(ids: string[], count: number): string[] {
  if (count >= ids.length) return ids.slice();
  // Fisher–Yates
  console.log('[word-fetcher] Fisher-Yates shuffle start:', { totalIds: ids.length, requestedCount: count });
  const arr = ids.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const randomValue = Math.random();
    const j = Math.floor(randomValue * (i + 1));
    console.log(`[word-fetcher] Fisher-Yates step ${i}: random=${randomValue}, j=${j}, swapping ${arr[i]} with ${arr[j]}`);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.slice(0, count);
  console.log('[word-fetcher] Fisher-Yates shuffle result:', result);
  return result;
}