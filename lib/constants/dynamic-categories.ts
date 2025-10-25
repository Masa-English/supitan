import { createClient } from '@supabase/supabase-js';
import { CategoryConfig } from './categories';

// Supabaseクライアントの作成（サーバーサイド対応）
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not found:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    });
    throw new Error('Supabase URL and Key are required');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// カテゴリーキャッシュ
let categoriesCache: CategoryConfig[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

/**
 * データベースからカテゴリー情報を動的に取得
 */
export async function getCategoriesFromDatabase(): Promise<CategoryConfig[]> {
  // キャッシュチェック
  const now = Date.now();
  if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoriesCache;
  }

  try {
    const supabase = getSupabaseClient();
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch categories from database:', error);
      throw error;
    }

    // データベースの形式をCategoryConfigに変換
    const categoryConfigs: CategoryConfig[] = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
      sort_order: category.sort_order || 0,
      is_active: category.is_active || true
    }));

    // キャッシュを更新
    categoriesCache = categoryConfigs;
    cacheTimestamp = now;

    console.log(`Loaded ${categoryConfigs.length} categories from database`);
    return categoryConfigs;

  } catch (error) {
    console.error('Error fetching categories from database:', error);
    
    // エラー時はキャッシュがあればそれを使用
    if (categoriesCache) {
      console.log('Using cached categories due to error');
      return categoriesCache;
    }
    
    // キャッシュもない場合は空配列を返す
    console.warn('No cached categories available, returning empty array');
    return [];
  }
}

/**
 * キャッシュをクリア（データ更新時などに使用）
 */
export function clearCategoriesCache(): void {
  categoriesCache = null;
  cacheTimestamp = 0;
}

/**
 * カテゴリー名から設定を取得
 */
export async function getCategoryConfigByName(name: string): Promise<CategoryConfig | undefined> {
  const categories = await getCategoriesFromDatabase();
  return categories.find(cat => cat.name === name);
}

/**
 * 全カテゴリー設定を取得（ソート順）
 */
export async function getAllCategories(): Promise<CategoryConfig[]> {
  return await getCategoriesFromDatabase();
}

/**
 * カテゴリーIDの配列を取得
 */
export async function getCategoryIds(): Promise<string[]> {
  const categories = await getCategoriesFromDatabase();
  return categories.map(cat => cat.id);
}

/**
 * カテゴリー名の配列を取得
 */
export async function getCategoryNames(): Promise<string[]> {
  const categories = await getCategoriesFromDatabase();
  return categories.map(cat => cat.name);
}

/**
 * アクティブなカテゴリーのみ取得
 */
export async function getActiveCategories(): Promise<CategoryConfig[]> {
  const categories = await getCategoriesFromDatabase();
  return categories.filter(cat => cat.is_active);
}

/**
 * カテゴリー名からIDを取得
 */
export async function getCategoryIdByName(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config?.id;
}

/**
 * カテゴリーIDから名前を取得（完全なUUIDまたは短縮UUIDに対応）
 */
export async function getCategoryNameById(id: string): Promise<string | undefined> {
  const categories = await getCategoriesFromDatabase();
  
  // まず完全なUUIDで検索
  let config = categories.find(cat => cat.id === id);
  if (config) return config.name;

  // UUIDの最初の8桁で検索（短縮IDで検索）
  if (id.length >= 8) {
    const shortId = id.substring(0, 8);
    config = categories.find(cat => cat.id.startsWith(shortId));
    if (config) return config.name;
  }

  return undefined;
}

/**
 * UUIDの最初の8桁をスラッグとして取得
 */
export function getCategorySlugFromUuid(uuid: string): string {
  return uuid.length >= 8 ? uuid.substring(0, 8) : uuid;
}

/**
 * カテゴリー名から短縮IDを取得（URL用）
 */
export async function getCategoryShortId(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config ? getCategorySlugFromUuid(config.id) : undefined;
}

/**
 * カテゴリーIDからURLスラッグを取得（UUIDまたは短縮IDから）
 */
export function getCategorySlugFromId(id: string): string {
  // 完全なUUIDの場合
  if (id.length > 8) {
    return getCategorySlugFromUuid(id);
  }
  // 既に短縮IDの場合
  return id;
}

/**
 * カテゴリーIDから設定を取得
 */
export async function getCategoryConfig(id: string): Promise<CategoryConfig | undefined> {
  const categories = await getCategoriesFromDatabase();
  return categories.find(cat => cat.id === id);
}

/**
 * カテゴリー名から英語名を取得（データベースにはないため、名前をそのまま返す）
 */
export async function getCategoryEnglishName(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config?.name; // 英語名がないので日本語名を返す
}

/**
 * カテゴリー名からPOSタグを取得（データベースにはないため、汎用的なタグを返す）
 */
export async function getCategoryPos(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config ? '品詞' : undefined; // 汎用的なタグを返す
}

/**
 * カテゴリー名から色を取得
 */
export async function getCategoryColor(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config?.color;
}

/**
 * カテゴリー名からアイコンを取得（データベースにはないため、汎用的なアイコンを返す）
 */
export async function getCategoryIcon(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config ? '📚' : undefined; // 汎用的なアイコンを返す
}

/**
 * カテゴリー名から説明を取得
 */
export async function getCategoryDescription(name: string): Promise<string | undefined> {
  const config = await getCategoryConfigByName(name);
  return config?.description;
}

/**
 * カテゴリーが有効かチェック
 */
export async function isValidCategory(name: string): Promise<boolean> {
  const config = await getCategoryConfigByName(name);
  return config !== undefined;
}

/**
 * カテゴリー名を正規化（空白除去、トリム）
 */
export function normalizeCategoryName(name: string): string {
  return name.trim();
}

/**
 * カテゴリー統計情報の型
 */
export interface CategoryStats {
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  count: number;
  progress?: number;
}

/**
 * カテゴリー統計情報を生成
 */
export async function createCategoryStats(
  categoryName: string,
  count: number,
  progress?: number
): Promise<CategoryStats | null> {
  const config = await getCategoryConfigByName(categoryName);
  if (!config) return null;

  return {
    name: config.name,
    description: config.description,
    color: config.color,
    sort_order: config.sort_order,
    is_active: config.is_active,
    count,
    progress
  };
}

/**
 * 全カテゴリーの統計情報を生成
 */
export async function createAllCategoryStats(
  categoryCounts: Record<string, number>,
  categoryProgress?: Record<string, number>
): Promise<CategoryStats[]> {
  const categories = await getCategoriesFromDatabase();
  return categories.map(config => ({
    name: config.name,
    description: config.description,
    color: config.color,
    sort_order: config.sort_order,
    is_active: config.is_active,
    count: categoryCounts[config.name] || 0,
    progress: categoryProgress?.[config.name] || 0
  }));
}

/**
 * カテゴリー名の表示用フォーマット
 */
export async function formatCategoryName(name: string): Promise<string> {
  const config = await getCategoryConfigByName(name);
  if (!config) return name;

  return config.name;
}

/**
 * カテゴリーの詳細表示用フォーマット
 */
export async function formatCategoryDetails(name: string): Promise<{
  displayName: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
} | null> {
  const config = await getCategoryConfigByName(name);
  if (!config) return null;

  return {
    displayName: config.name,
    description: config.description,
    color: config.color,
    sort_order: config.sort_order,
    is_active: config.is_active
  };
}
