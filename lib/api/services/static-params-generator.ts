/**
 * 静的パラメータ生成のためのユーティリティ
 * ビルド時のデータベース接続問題を回避しつつSSGを実現
 */

import { createClient } from '@supabase/supabase-js';

// データベースクエリ結果の型定義
interface CategoryWithName {
  name?: string;
}

interface WordWithCategory {
  category_id: string;
  section: string | null;
  categories?: CategoryWithName | null;
  [key: string]: unknown;
}

interface CategoryWithId {
  id: string;
  name: string;
}

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

// ビルド時専用のSupabaseクライアント
function createBuildTimeClient() {
  try {
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
      global: {
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Next.js Build-Time Generator',
        },
      },
      db: {
        schema: 'public',
      },
    });
  } catch (error) {
    console.warn('Failed to create build-time Supabase client:', error);
    return null;
  }
}

/**
 * カテゴリー名を検証して有効なものを返す
 */
function validateCategoryName(name: string): boolean {
  try {
    // カテゴリー名が適切な形式かチェック
    if (!name || typeof name !== 'string') {
      return false;
    }

    // 特殊文字を含むカテゴリー名も有効とする（Next.js設定で対応）
    return true;
  } catch (error) {
    console.warn('Category name validation error:', error);
    return false;
  }
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

    // タイムアウト付きでクエリを実行
    const queryPromise = supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 30000)
    );

    const queryResult = await Promise.race([queryPromise, timeoutPromise]);
    const { data, error } = queryResult as { data: { id: string; name: string }[] | null; error: SupabaseError | null };

    if (error) {
      console.warn('Database query failed, using fallback:', error.message);
      return ['b464ce08-9440-4178-923f-4d251b8dc0ab', '6effaf5d-619c-4a70-b36d-9464549eadda', '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9', '71bfd0a1-cc79-4257-bd4a-15d30d37555f', '618464f6-6c7a-450a-9074-89e6d7becef9']; // 完全なUUIDのフォールバック
    }

    // 完全なUUIDを取得
    const categories = Array.from(new Set(data?.map((item: { id: string; name: string }) => {
      return item.id;
    }).filter(Boolean) || []));

    // カテゴリー名の検証
    const validCategories = categories.filter(validateCategoryName);

    console.log(`Build-time categories found: ${validCategories.length}`, validCategories);
    console.log(`Filtered out ${categories.length - validCategories.length} invalid categories`);

    // データが取得できない場合はフォールバックを使用
    if (validCategories.length === 0) {
      console.warn('No valid categories found in database, using fallback');
      return ['b464ce08-9440-4178-923f-4d251b8dc0ab', '6effaf5d-619c-4a70-b36d-9464549eadda', '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9', '71bfd0a1-cc79-4257-bd4a-15d30d37555f', '618464f6-6c7a-450a-9074-89e6d7becef9'];
    }

    return validCategories;
  } catch (error) {
    console.warn('Build-time category fetch failed:', error);
    return ['b464ce08-9440-4178-923f-4d251b8dc0ab', '6effaf5d-619c-4a70-b36d-9464549eadda', '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9', '71bfd0a1-cc79-4257-bd4a-15d30d37555f', '618464f6-6c7a-450a-9074-89e6d7becef9']; // 完全なUUIDフォールバック
  }
}

/**
 * カテゴリー別セクション一覧を取得（ビルド時用）
 */
export async function getBuildTimeSections(categoryName: string): Promise<string[]> {
  try {
    const supabase = createBuildTimeClient();
    if (!supabase) {
      console.warn(`Falling back to default sections for ${categoryName}`);
      return ['1', '2', '3']; // フォールバック
    }

    // カテゴリーIDから名前を取得
    const { getCategoryNameById } = await import('@/lib/constants/categories');
    const categoryNameFromId = getCategoryNameById(categoryName);

    if (!categoryNameFromId) {
      console.warn(`Category not found: ${categoryName}, falling back to default sections`);
      return ['1', '2', '3']; // フォールバック
    }

    console.log(`Querying sections for category: "${categoryNameFromId}" (id: "${categoryName}")`);

    // タイムアウト付きでカテゴリーIDを取得
    const categoryQueryPromise = supabase
      .from('categories')
      .select('id')
      .eq('name', categoryNameFromId)
      .single();

    const categoryTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Category query timeout')), 15000)
    );

    const categoryQueryResult = await Promise.race([
      categoryQueryPromise,
      categoryTimeoutPromise
    ]);
    const { data: categoryData, error: categoryError } = categoryQueryResult as { data: { id: string } | null; error: SupabaseError | null };

    if (categoryError || !categoryData) {
      console.warn(`Category not found: ${categoryName}, using fallback`);
      return ['1', '2', '3']; // フォールバック
    }

    // タイムアウト付きでセクションを取得
    const sectionQueryPromise = supabase
      .from('words')
      .select('section')
      .eq('category_id', categoryData.id)
      .order('section');

    const sectionTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Section query timeout')), 15000)
    );

    const sectionQueryResult = await Promise.race([
      sectionQueryPromise,
      sectionTimeoutPromise
    ]);

    const { data, error } = sectionQueryResult as { data: { section: string | null }[] | null; error: SupabaseError | null };

    if (error) {
      console.warn(`Section query failed for ${categoryName}, using fallback:`, error.message);
      return ['1', '2', '3']; // フォールバック
    }

    const sections = Array.from(
      new Set(
        data?.map((item: { section: string | null }) => String(item.section ?? '')).filter(Boolean) || []
      )
    ).sort();

    console.log(`Build-time sections for ${categoryName}: ${sections.length} sections found:`, sections);
    return sections.length > 0 ? sections : ['1', '2', '3'];
  } catch (error) {
    console.warn(`Build-time section fetch failed for ${categoryName}:`, error);
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
      .order('sort_order') as { data: CategoryWithId[] | null; error: SupabaseError | null };

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
        .eq('category_id', category.id) as { data: { section: string | null }[] | null; error: SupabaseError | null };

      // データベースに単語テーブルが存在しない場合のチェック
      if (wordsError && typeof wordsError === 'object' && 'code' in wordsError && (wordsError as { code: string }).code === '42P01') {
        console.warn(`Words table does not exist, skipping category: "${category.name}"`);
        continue;
      }

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
          category: category.id, // 完全なUUIDを使用
          sec: section
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
        .limit(1000) as { data: WordWithCategory[] | null; error: SupabaseError | null };

      if (!error && wordsData && wordsData.length > 0) {
        const categoryMap = new Map<string, Set<string>>();

        wordsData.forEach((item: WordWithCategory) => {
          const categoryId = item.category_id;
          const section = String(item.section ?? '');

          if (categoryId && section) {
            // 完全なUUIDを使用
            const fullId = categoryId;
            if (!categoryMap.has(fullId)) {
              categoryMap.set(fullId, new Set());
            }
            categoryMap.get(fullId)!.add(section);
          }
        });

        const pairs: { category: string; sec: string }[] = [];
        categoryMap.forEach((sections, categoryId) => {
          sections.forEach(section => {
            pairs.push({
              category: categoryId, // 完全なUUIDを使用
              sec: section
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
    { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab', sec: '1' }, // 完全なUUIDを使用
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