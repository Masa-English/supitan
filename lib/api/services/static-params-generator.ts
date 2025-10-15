/**
 * 静的パラメータ生成のためのユーティリティ
 * ビルド時のデータベース接続問題を回避しつつSSGを実現
 */

import { createClient } from '@supabase/supabase-js';

// ビルド時専用のSupabaseクライアント
function createBuildTimeClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not available for build-time generation');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * カテゴリー一覧を取得（ビルド時用）
 */
export async function getBuildTimeCategories(): Promise<string[]> {
  try {
    const supabase = createBuildTimeClient();
    if (!supabase) {
      console.warn('Supabase client not available, using fallback categories');
      return ['句動詞', '動詞', '名詞', '形容詞', '副詞']; // フォールバック
    }

    console.log('Fetching categories from database...');
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) {
      console.warn('Database query failed, using fallback:', error.message);
      return ['句動詞', '動詞', '名詞', '形容詞', '副詞']; // フォールバック
    }
    
    const categories = Array.from(new Set(data?.map(item => item.name).filter(Boolean) || []));
    console.log(`Build-time categories found: ${categories.length}`, categories);
    
    // データが取得できない場合はフォールバックを使用
    if (categories.length === 0) {
      console.warn('No categories found in database, using fallback');
      return ['句動詞', '動詞', '名詞', '形容詞', '副詞'];
    }
    
    return categories;
  } catch (error) {
    console.warn('Build-time category fetch failed:', error);
    return ['句動詞', '動詞', '名詞', '形容詞', '副詞']; // フォールバック
  }
}

/**
 * カテゴリー別セクション一覧を取得（ビルド時用）
 */
export async function getBuildTimeSections(category: string): Promise<string[]> {
  try {
    const supabase = createBuildTimeClient();
    if (!supabase) {
      console.warn(`Falling back to default sections for ${category}`);
      return ['1', '2', '3']; // フォールバック
    }

    // URLデコードしてからクエリ実行
    const decodedCategory = decodeURIComponent(category);
    console.log(`Querying sections for category: "${decodedCategory}" (original: "${category}")`);

    // まずカテゴリーIDを取得
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', decodedCategory)
      .single();
    
    if (categoryError || !categoryData) {
      console.warn(`Category not found: ${decodedCategory}, using fallback`);
      return ['1', '2', '3']; // フォールバック
    }
    
    // カテゴリーIDでセクションを取得
    const { data, error } = await supabase
      .from('words')
      .select('section')
      .eq('category_id', categoryData.id)
      .order('section');
    
    if (error) {
      console.warn(`Section query failed for ${decodedCategory}, using fallback:`, error.message);
      return ['1', '2', '3']; // フォールバック
    }
    
    const sections = Array.from(
      new Set(
        data?.map(item => String(item.section ?? '')).filter(Boolean) || []
      )
    ).sort();
    
    console.log(`Build-time sections for ${decodedCategory}: ${sections.length} sections found:`, sections);
    return sections.length > 0 ? sections : ['1', '2', '3'];
  } catch (error) {
    console.warn(`Build-time section fetch failed for ${category}:`, error);
    return ['1', '2', '3']; // フォールバック
  }
}

/**
 * 全カテゴリー・セクション組み合わせを取得（ビルド時用）
 * 実際に単語が存在するカテゴリーのみを対象とする
 */
export async function getBuildTimeCategorySectionPairs(): Promise<{ category: string; sec: string }[]> {
  try {
    const supabase = createBuildTimeClient();
    if (!supabase) {
      console.warn('Supabase client not available, using fallback with validation');
      return getFallbackCategorySectionPairs();
    }

    // まず全カテゴリーを取得
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order');

    if (categoriesError) {
      console.warn('Categories query failed, using fallback:', categoriesError.message);
      return getFallbackCategorySectionPairs();
    }

    const pairs: { category: string; sec: string }[] = [];

    for (const category of categoriesData || []) {
      console.log(`Processing category: "${category.name}"`);

      // このカテゴリーに単語が存在するかチェック
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('section', { count: 'exact' })
        .eq('category_id', category.id);

      if (wordsError) {
        console.warn(`Words query failed for ${category.name}:`, wordsError.message);
        continue;
      }

      if (!wordsData || wordsData.length === 0) {
        console.log(`No words found for category: "${category.name}", skipping`);
        continue;
      }

      // セクションを取得（単語データから）
      const sections = Array.from(
        new Set(
          wordsData.map(item => String(item.section ?? '')).filter(Boolean)
        )
      ).sort();

      if (sections.length === 0) {
        console.log(`No valid sections found for category: "${category.name}", skipping`);
        continue;
      }

      console.log(`Found ${sections.length} sections for ${category.name}:`, sections);

      for (const section of sections) {
        pairs.push({
          category: encodeURIComponent(category.name),
          sec: encodeURIComponent(section)
        });
      }
    }

    if (pairs.length === 0) {
      console.warn('No category-section pairs found with actual data, using fallback');
      return getFallbackCategorySectionPairs();
    }

    console.log(`Generated ${pairs.length} category-section pairs for build:`, pairs);
    return pairs;
  } catch (error) {
    console.error('Failed to generate category-section pairs:', error);
    return getFallbackCategorySectionPairs();
  }
}

/**
 * フォールバック用のカテゴリー・セクション組み合わせを取得
 */
async function getFallbackCategorySectionPairs(): Promise<{ category: string; sec: string }[]> {
  // 実際のデータベースから動詞カテゴリーの情報を取得
  try {
    const supabase = createBuildTimeClient();
    if (supabase) {
      const { data: wordsData, error } = await supabase
        .from('words')
        .select('category_id, section, categories!inner(name)')
        .eq('categories.is_active', true)
        .limit(1000);

      if (!error && wordsData && wordsData.length > 0) {
        const categoryMap = new Map<string, Set<string>>();

        wordsData.forEach(item => {
          const categoryName = (item.categories as { name?: string })?.name;
          const section = String(item.section ?? '');

          if (categoryName && section) {
            if (!categoryMap.has(categoryName)) {
              categoryMap.set(categoryName, new Set());
            }
            categoryMap.get(categoryName)!.add(section);
          }
        });

        const pairs: { category: string; sec: string }[] = [];
        categoryMap.forEach((sections, category) => {
          sections.forEach(section => {
            pairs.push({
              category: encodeURIComponent(category),
              sec: encodeURIComponent(section)
            });
          });
        });

        if (pairs.length > 0) {
          console.log(`Using fallback with ${pairs.length} pairs from actual data`);
          return pairs;
        }
      }
    }
  } catch (error) {
    console.warn('Fallback data query failed:', error);
  }

  // 最終フォールバック
  console.warn('Using minimal fallback pairs');
  return [
    { category: encodeURIComponent('動詞'), sec: '1' },
  ];
}

/**
 * 安全なgenerateStaticParams実装
 */
export async function safeGenerateStaticParams<T>(
  generator: () => Promise<T[]>,
  fallback: T[] = []
): Promise<T[]> {
  try {
    const result = await generator();
    return result.length > 0 ? result : fallback;
  } catch (error) {
    console.warn('Static params generation failed, using fallback:', error);
    return fallback;
  }
}