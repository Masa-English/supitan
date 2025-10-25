export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

// カテゴリー設定（データベースのUUIDに対応）
export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'b464ce08-9440-4178-923f-4d251b8dc0ab',
    name: '動詞',
    description: '基本的な動詞',
    color: '#3b82f6',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'c6ab103e-e829-41e0-9482-85e8e0a59b25',
    name: '名詞',
    description: '基本的な名詞',
    color: '#10b981',
    sort_order: 2,
    is_active: true
  },
  {
    id: '5a55ffb9-d020-49ac-81be-a256d7a24c8f',
    name: '形容詞',
    description: '基本的な形容詞',
    color: '#f59e0b',
    sort_order: 3,
    is_active: true
  },
  {
    id: '41240a24-458d-4184-9ef6-e8d1c8620d9d',
    name: '副詞',
    description: '基本的な副詞',
    color: '#8b5cf6',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'fd181354-21ea-48d7-b4fa-8b6e1ca0264c',
    name: '句動詞',
    description: '句動詞',
    color: '#ef4444',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'b4bec9d1-a451-47f4-b1b6-2b1f0ef586f8',
    name: '前置詞',
    description: '前置詞',
    color: '#06b6d4',
    sort_order: 6,
    is_active: true
  },
  {
    id: 'ee6355f8-bd2d-46f3-8342-ccb80369c185',
    name: '接続詞',
    description: '接続詞',
    color: '#84cc16',
    sort_order: 7,
    is_active: true
  },
  {
    id: '10d85f98-a88b-4f28-a20f-0a5b9851ff02',
    name: '代名詞',
    description: '代名詞',
    color: '#ec4899',
    sort_order: 8,
    is_active: true
  }
];

// カテゴリー名から設定を取得
export function getCategoryConfigByName(name: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.name === name);
}

// 全カテゴリー設定を取得（ソート順）
export function getAllCategories(): CategoryConfig[] {
  return CATEGORIES.sort((a, b) => a.sort_order - b.sort_order);
}

// カテゴリーIDの配列を取得
export function getCategoryIds(): string[] {
  return CATEGORIES.map(cat => cat.id);
}

// カテゴリー名の配列を取得
export function getCategoryNames(): string[] {
  return CATEGORIES.map(cat => cat.name);
}

// アクティブなカテゴリーのみ取得
export function getActiveCategories(): CategoryConfig[] {
  return getAllCategories();
}

// カテゴリー名からIDを取得
export function getCategoryIdByName(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.id;
}

// カテゴリーIDから名前を取得（完全なUUIDまたは短縮UUIDに対応）
export function getCategoryNameById(id: string): string | undefined {
  // まず完全なUUIDで検索
  let config = getCategoryConfig(id);
  if (config) return config.name;

  // UUIDの最初の8桁で検索（短縮IDで検索）
  if (id.length >= 8) {
    const shortId = id.substring(0, 8);
    // 短縮IDで検索する場合は、CATEGORIES配列から最初の8文字が一致するものを探す
    config = CATEGORIES.find(cat => cat.id.startsWith(shortId));
    if (config) return config.name;
  }

  return undefined;
}

// UUIDの最初の8桁をスラッグとして取得
export function getCategorySlugFromUuid(uuid: string): string {
  return uuid.length >= 8 ? uuid.substring(0, 8) : uuid;
}

// カテゴリー名から短縮IDを取得（URL用）
export function getCategoryShortId(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config ? getCategorySlugFromUuid(config.id) : undefined;
}

// カテゴリーIDからURLスラッグを取得（UUIDまたは短縮IDから）
export function getCategorySlugFromId(id: string): string {
  // 完全なUUIDの場合
  if (id.length > 8) {
    return getCategorySlugFromUuid(id);
  }
  // 既に短縮IDの場合
  return id;
}



// カテゴリーIDから設定を取得
export function getCategoryConfig(id: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

// カテゴリー名から英語名を取得（データベースにはないため、名前をそのまま返す）
export function getCategoryEnglishName(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.name; // 英語名がないので日本語名を返す
}

// カテゴリー名からPOSタグを取得（データベースにはないため、汎用的なタグを返す）
export function getCategoryPos(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config ? '品詞' : undefined; // 汎用的なタグを返す
}

// カテゴリー名から色を取得
export function getCategoryColor(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.color;
}

// カテゴリー名からアイコンを取得（データベースにはないため、汎用的なアイコンを返す）
export function getCategoryIcon(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config ? '📚' : undefined; // 汎用的なアイコンを返す
}

// カテゴリー名から説明を取得
export function getCategoryDescription(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.description;
}

// カテゴリーが有効かチェック
export function isValidCategory(name: string): boolean {
  return getCategoryConfigByName(name) !== undefined;
}

// カテゴリー名を正規化（空白除去、トリム）
export function normalizeCategoryName(name: string): string {
  return name.trim();
}

// カテゴリー統計情報の型
export interface CategoryStats {
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  count: number;
  progress?: number;
}

// カテゴリー統計情報を生成
export function createCategoryStats(
  categoryName: string,
  count: number,
  progress?: number
): CategoryStats | null {
  const config = getCategoryConfigByName(categoryName);
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

// 全カテゴリーの統計情報を生成
export function createAllCategoryStats(
  categoryCounts: Record<string, number>,
  categoryProgress?: Record<string, number>
): CategoryStats[] {
  return getAllCategories().map(config => ({
    name: config.name,
    description: config.description,
    color: config.color,
    sort_order: config.sort_order,
    is_active: config.is_active,
    count: categoryCounts[config.name] || 0,
    progress: categoryProgress?.[config.name] || 0
  }));
}


// カテゴリー名の表示用フォーマット
export function formatCategoryName(name: string): string {
  const config = getCategoryConfigByName(name);
  if (!config) return name;

  return config.name;
}

// カテゴリーの詳細表示用フォーマット
export function formatCategoryDetails(name: string): {
  displayName: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
} | null {
  const config = getCategoryConfigByName(name);
  if (!config) return null;

  return {
    displayName: config.name,
    description: config.description,
    color: config.color,
    sort_order: config.sort_order,
    is_active: config.is_active
  };
}