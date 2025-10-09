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

    return (
      <CategoriesClient categories={categories} />
    );
  } catch (error) {
    console.error('Categories page error:', error);
    
    // エラー時のフォールバック表示
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                カテゴリー選択
              </h1>
              <p className="text-muted-foreground">
                学習したいカテゴリーを選択してください
              </p>
            </div>
            
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                データの読み込みに失敗しました。しばらく時間をおいて再度お試しください。
              </p>
            </Card>
          </div>
        </main>
      </div>
    );
  }
}