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
  const { category, sectionIndex, sectionSize, randomCount, sectionValue } = options;
  
  // URLデコードを確実に実行
  const decodedCategory = category ? decodeURIComponent(category) : undefined;

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
    if (decodedCategory) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', decodedCategory)
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
    if (decodedCategory) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', decodedCategory)
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
    if (decodedCategory) {
      // まずカテゴリーIDを取得
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', decodedCategory)
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
  if (decodedCategory) {
    // まずカテゴリーIDを取得
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', decodedCategory)
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
  const arr = ids.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}