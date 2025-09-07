export interface CategoryConfig {
  id: string;
  name: string;
  englishName: string;
  pos: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
}

// カテゴリー設定
export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'verbs',
    name: '動詞',
    englishName: 'Verbs',
    pos: 'V',
    description: '動作や状態を表す動詞',
    color: '#3B82F6',
    icon: '⚡',
    sortOrder: 1
  },
  {
    id: 'phrasal_verbs',
    name: '句動詞',
    englishName: 'Phrasal Verbs',
    pos: 'PV',
    description: '動詞と前置詞・副詞の組み合わせ',
    color: '#8B5CF6',
    icon: '🔗',
    sortOrder: 2
  },
  {
    id: 'adjectives',
    name: '形容詞',
    englishName: 'Adjectives',
    pos: 'ADJ',
    description: '人や物の性質・状態を表す形容詞',
    color: '#10B981',
    icon: '🎨',
    sortOrder: 3
  },
  {
    id: 'adverbs',
    name: '副詞',
    englishName: 'Adverbs',
    pos: 'ADV',
    description: '動詞・形容詞・副詞を修飾する副詞',
    color: '#F59E0B',
    icon: '⚙️',
    sortOrder: 4
  },
  {
    id: 'nouns',
    name: '名詞',
    englishName: 'Nouns',
    pos: 'N',
    description: '人・物・事柄を表す名詞',
    color: '#EF4444',
    icon: '📦',
    sortOrder: 5
  },
  {
    id: 'phrases',
    name: 'フレーズ',
    englishName: 'Phrases',
    pos: 'PHR',
    description: 'よく使われる表現やフレーズ',
    color: '#06B6D4',
    icon: '💬',
    sortOrder: 6
  },
  {
    id: 'idioms',
    name: 'イディオム',
    englishName: 'Idioms',
    pos: 'IDIOM',
    description: '慣用句やイディオム',
    color: '#EC4899',
    icon: '🎭',
    sortOrder: 7
  },
  {
    id: 'reactions',
    name: 'リアクション',
    englishName: 'Reactions',
    pos: 'REACT',
    description: '感情や反応を表す表現',
    color: '#84CC16',
    icon: '😊',
    sortOrder: 8
  }
];

// カテゴリーIDから設定を取得
export function getCategoryConfig(id: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

// カテゴリー名から設定を取得
export function getCategoryConfigByName(name: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.name === name);
}

// 全カテゴリー設定を取得（ソート順）
export function getAllCategories(): CategoryConfig[] {
  return CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder);
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

// カテゴリーIDから名前を取得
export function getCategoryNameById(id: string): string | undefined {
  const config = getCategoryConfig(id);
  return config?.name;
}

// カテゴリー名から英語名を取得
export function getCategoryEnglishName(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.englishName;
}

// カテゴリー名からPOSタグを取得
export function getCategoryPos(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.pos;
}

// カテゴリー名から色を取得
export function getCategoryColor(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.color;
}

// カテゴリー名からアイコンを取得
export function getCategoryIcon(name: string): string | undefined {
  const config = getCategoryConfigByName(name);
  return config?.icon;
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
  englishName: string;
  pos: string;
  description: string;
  color: string;
  icon: string;
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
    englishName: config.englishName,
    pos: config.pos,
    description: config.description,
    color: config.color,
    icon: config.icon,
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
    englishName: config.englishName,
    pos: config.pos,
    description: config.description,
    color: config.color,
    icon: config.icon,
    count: categoryCounts[config.name] || 0,
    progress: categoryProgress?.[config.name] || 0
  }));
}

// カテゴリー名をURLエンコード
export function encodeCategoryName(name: string): string {
  return encodeURIComponent(name);
}

// URLエンコードされたカテゴリー名をデコード
export function decodeCategoryName(encodedName: string): string {
  return decodeURIComponent(encodedName);
}

// カテゴリー名の表示用フォーマット
export function formatCategoryName(name: string): string {
  const config = getCategoryConfigByName(name);
  if (!config) return name;
  
  return `${config.icon} ${config.name}`;
}

// カテゴリーの詳細表示用フォーマット
export function formatCategoryDetails(name: string): {
  displayName: string;
  englishName: string;
  pos: string;
  description: string;
} | null {
  const config = getCategoryConfigByName(name);
  if (!config) return null;

  return {
    displayName: `${config.icon} ${config.name}`,
    englishName: config.englishName,
    pos: config.pos,
    description: config.description
  };
}