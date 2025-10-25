import { Card } from '@/components/ui/card';
import { dataProvider } from '@/lib/api/services';
import { CategoryWithStats } from '@/lib/types';
import CategoriesClient from './categories-client';

// SSG + ISR設定
export const revalidate = 3600; // 1時間

export default async function CategoriesPage() {
  try {
    // サーバーサイドでカテゴリーデータを取得
    const categories: CategoryWithStats[] = await dataProvider.getCategories();

    // カテゴリーが空の場合は空配列を渡す
    if (!categories || categories.length === 0) {
      console.warn('No categories found');
      return (
        <CategoriesClient categories={[]} />
      );
    }

    return (
      <CategoriesClient categories={categories} />
    );
  } catch (error) {
    console.error('Categories page error:', error);
    
    // エラー時は空配列を渡してクライアント側でエラーハンドリング
    return (
      <CategoriesClient categories={[]} />
    );
  }
}