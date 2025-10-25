export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

// 動的カテゴリー取得のための再エクスポート
export {
  getCategoriesFromDatabase,
  clearCategoriesCache,
  getCategoryConfigByName,
  getAllCategories,
  getCategoryIds,
  getCategoryNames,
  getActiveCategories,
  getCategoryIdByName,
  getCategoryNameById,
  getCategorySlugFromUuid,
  getCategoryShortId,
  getCategorySlugFromId,
  getCategoryConfig,
  getCategoryEnglishName,
  getCategoryPos,
  getCategoryColor,
  getCategoryIcon,
  getCategoryDescription,
  isValidCategory,
  normalizeCategoryName,
  createCategoryStats,
  createAllCategoryStats,
  formatCategoryName,
  formatCategoryDetails
} from './dynamic-categories';

// 後方互換性のための型定義
export interface CategoryStats {
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  count: number;
  progress?: number;
}