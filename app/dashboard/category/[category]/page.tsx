import { dataProvider } from '@/lib/data-provider';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain } from 'lucide-react';
import { Word, Category } from '@/lib/types';
import Link from 'next/link';
import { Suspense } from 'react';
import { UserProgressSection } from './user-progress-section';

// 統一されたISR設定
export const revalidate = 900; // 15分

// 動的メタデータの生成
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  return {
    title: `${decodedCategory} - 英単語学習 | Masa Flash`,
    description: `${decodedCategory}の英単語を効率的に学習しましょう。フラッシュカードとクイズで習得度を向上させます。`,
    openGraph: {
      title: `${decodedCategory} - 英単語学習`,
      description: `${decodedCategory}の英単語学習ページ`,
    },
  };
}

// 静的データ取得（cookiesを使用しない）
async function getStaticPageData(category: string): Promise<{
  words: Word[];
  categories: Category[];
}> {
  try {
    console.log(`Fetching data for category: ${category}`);
    
    // 統一データプロバイダーを使用してデータを一括取得
    const pageData = await dataProvider.getPageData('category', {
      category,
    });

    console.log(`Page data received:`, {
      wordsCount: pageData.words?.length || 0,
      categoriesCount: pageData.categories?.length || 0
    });

    return {
      words: pageData.words || [],
      categories: pageData.categories || [],
    };
  } catch (error) {
    console.error(`Error fetching data for category ${category}:`, error);
    throw error;
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    console.log(`Loading category: ${decodedCategory} (encoded: ${category})`);
    
    // 静的データを取得
    const { words } = await getStaticPageData(decodedCategory);
    console.log(`Found ${words?.length || 0} words for category: ${decodedCategory}`);

    // データが存在しない場合は404
    if (!words || words.length === 0) {
      console.log(`Category not found: ${decodedCategory}`);
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* ヘッダー */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                {decodedCategory}
              </h1>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground text-xs sm:text-sm">
                {words.length}個の単語
              </Badge>
            </div>
          </div>

          {/* ユーザー進捗統計（動的レンダリング） */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      読み込み中...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                      -
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <UserProgressSection totalWords={words.length} />
          </Suspense>

          {/* 学習モード選択 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <Link href={`/dashboard/category/${encodeURIComponent(decodedCategory)}/flashcard`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        フラッシュカード
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        単語を見て意味を覚える
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/dashboard/category/${encodeURIComponent(decodedCategory)}/quiz`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-secondary/15 rounded-xl group-hover:bg-secondary/25 transition-colors">
                      <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        クイズ
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        選択肢から正解を選ぶ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 単語一覧 */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                単語一覧
              </h2>
              <Link href={`/dashboard/category/${encodeURIComponent(decodedCategory)}/browse`}>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  詳細を見る
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {words.slice(0, 8).map((word) => (
                <Card key={word.id} className="bg-card border-border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-center space-y-1 sm:space-y-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        {word.word}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {word.japanese}
                      </p>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {word.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {words.length > 8 && (
              <div className="text-center mt-4 sm:mt-6">
                <Link href={`/dashboard/category/${encodeURIComponent(decodedCategory)}/browse`}>
                  <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs sm:text-sm">
                    すべての単語を見る ({words.length}個)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Category page error:', error);
    notFound();
  }
} 