import { dataProvider } from '@/lib/data-provider';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Play, ArrowLeft, Users, Target } from 'lucide-react';
import { Word, UserProgress, Category } from '@/lib/types';
import Link from 'next/link';

// 統一されたISR設定
export const revalidate = 900; // 15分

// 動的パラメータの生成
export async function generateStaticParams() {
  const categories = await dataProvider.getCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category.name),
  }));
}

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

interface PageData {
  words: Word[];
  categories: Category[];
  user: { id: string; email?: string } | null;
  userProgress: UserProgress[];
}

async function getPageData(category: string): Promise<PageData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 統一データプロバイダーを使用してデータを一括取得
  const pageData = await dataProvider.getPageData('category', {
    category,
    userId: user?.id,
  });

  return {
    words: pageData.words,
    categories: pageData.categories || [],
    user,
    userProgress: pageData.userProgress || [],
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    
    const { words, userProgress } = await getPageData(decodedCategory);

    if (words.length === 0) {
      notFound();
    }

    // 進捗統計の計算
    const stats = {
      total: words.length,
      studied: userProgress.filter(p => (p.study_count || 0) > 0).length,
      mastered: userProgress.filter(p => (p.mastery_level || 0) >= 0.8).length,
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link href="/protected">
              <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                カテゴリー一覧に戻る
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200">
                {decodedCategory}
              </h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {stats.total}個の単語
              </Badge>
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  総単語数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  学習済み
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.studied}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  習得済み
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.mastered}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 学習モード選択 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/flashcard`}>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                    <BookOpen className="h-6 w-6" />
                    フラッシュカード学習
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 dark:text-blue-400 mb-4">
                    単語カードをめくって意味を確認し、じっくりと学習できます。
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    学習を開始
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/quiz`}>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-green-200 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-200">
                    <Brain className="h-6 w-6" />
                    クイズ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 dark:text-green-400 mb-4">
                    4択クイズで理解度をテストし、知識を定着させます。
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    クイズを開始
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 単語一覧プレビュー */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">
                単語一覧プレビュー（最初の10個）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {words.slice(0, 10).map((word) => (
                  <div
                    key={word.id}
                    className="p-4 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10"
                  >
                    <div className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      {word.word}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      {word.japanese}
                    </div>
                  </div>
                ))}
              </div>
              {words.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-amber-600 dark:text-amber-400">
                    他 {words.length - 10} 個の単語があります
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Category page error:', error);
    notFound();
  }
} 